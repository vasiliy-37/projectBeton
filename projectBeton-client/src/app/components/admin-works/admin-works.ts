import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkService } from '../../services/work.service';

@Component({
  selector: 'app-admin-works',
  imports: [CommonModule, ],
  templateUrl: './admin-works.html',
  styleUrl: './admin-works.less'
})

export class AdminWorks {
  public workService = inject(WorkService);
  
  // Временное хранилище для фото, которое мы выбрали, но еще не сохранили
  previewImage = signal<string | null>(null);

  constructor() {
    this.workService.loadAll(); // Сразу просим сервис загрузить список
  }

  // Метод выбора файла
  async onFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  console.log('Исходный размер:', (file.size / 1024 / 1024).toFixed(2), 'MB');

  // Ждем, пока магия сжатия сработает
  const compressedBase64 = await this.compressImage(file);
  
  // Кладем в превью уже сжатую строку
  this.previewImage.set(compressedBase64);
  console.log('Новый размер (примерно):', (compressedBase64.length / 1024 / 1024).toFixed(2), 'MB');
}

private compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Устанавливаем максимальную ширину (1200px — золотая середина)
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        // Рисуем уменьшенное изображение на холсте
        ctx?.drawImage(img, 0, 0, width, height);

        // Превращаем холст обратно в строку Base64
        // 'image/webp' — супер легкий формат, 0.7 — качество (70%)
        const compressedData = canvas.toDataURL('image/webp', 0.7);
        resolve(compressedData);
      };
    };
  });
}

  // Метод сохранения
  save(titleInput: HTMLInputElement) {
    const title = titleInput.value;
    const imageData = this.previewImage();

    if (title && imageData) {
      // Вызываем метод сервиса (вариант 1 с .update)
      this.workService.create({ title, imageData });
      
      // Чистим форму
      this.previewImage.set(null);
      titleInput.value = '';
    }
  }
}