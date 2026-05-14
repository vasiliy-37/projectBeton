import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
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
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    console.log('Исходный размер:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    try {
      const compressedBase64 = await this.compressImage(file);
      this.previewImage.set(compressedBase64);
      console.log(
        'Размер data URL (символов), МБ:',
        (compressedBase64.length / 1024 / 1024).toFixed(2),
      );
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Не удалось обработать фото (попробуйте JPEG или PNG).');
      this.previewImage.set(null);
      input.value = '';
    }
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (!dataUrl) {
          reject(new Error('Пустой файл.'));
          return;
        }

        const img = new Image();
        img.onerror = () =>
          reject(
            new Error(
              'Не удалось открыть изображение. Попробуйте другой файл (JPEG/PNG), с телефона иногда мешает формат HEIC.',
            ),
          );
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas недоступен в этом браузере.'));
            return;
          }

          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;
          if (width < 1 || height < 1) {
            reject(new Error('Некорректный размер изображения.'));
            return;
          }

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          try {
            let compressedData = canvas.toDataURL('image/webp', 0.7);
            if (
              !compressedData ||
              compressedData.length < 64 ||
              !compressedData.includes('base64')
            ) {
              compressedData = canvas.toDataURL('image/jpeg', 0.82);
            }
            resolve(compressedData);
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  // Метод сохранения
  async save(titleInput: HTMLInputElement) {
    const title = titleInput.value.trim();
    const imageData = this.previewImage();

    if (!title || !imageData) {
      alert('Укажите название и выберите фото.');
      return;
    }

    try {
      await firstValueFrom(this.workService.create({ title, imageData }));
      this.previewImage.set(null);
      titleInput.value = '';
      alert('Сохранено на сайт.');
    } catch (e: unknown) {
      console.error(e);
      const err = e as { error?: { error?: string }; message?: string };
      const msg = err?.error?.error || err?.message || 'Ошибка сохранения (см. консоль и вкладку «Сеть»).';
      alert(msg);
    }
  }
}