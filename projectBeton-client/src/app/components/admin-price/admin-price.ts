import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Добавь для пайпов и базовых штук
import { firstValueFrom } from 'rxjs';

export interface Brand {
  _id: string;
  brand: string;
  price: number; // Сделаем обязательным для админки
  category: string;
  isEditing?: boolean; // ЛОКАЛЬНОЕ поле для UI
}

@Component({
  selector: 'app-admin-price',
  standalone: true,
  imports: [FormsModule, CommonModule], // Добавь CommonModule
  templateUrl: './admin-price.html',
  styleUrl: './admin-price.less'
})
export class AdminPrice implements OnInit {
  brands = signal<Brand[]>([]);
  isLoading = signal(true);
  
  // Состояние для новой марки
  newBrand = signal({ brand: '', price: 0, category: '' });
  isCreating = signal(false);

  private http = inject(HttpClient);
  private apiUrl = '/api/brands';

  ngOnInit() { this.fetchData(); }

  // Вспомогательная функция сортировки (чтобы категории всегда шли вместе)
  private sortBrands(brands: Brand[]): Brand[] {
    return [...brands].sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return a.brand.localeCompare(b.brand);
    });
  }

  async fetchData() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<Brand[]>(this.apiUrl));
      // При получении данных добавляем всем isEditing: false
      const formattedData = data.map(b => ({ ...b, isEditing: false }));
      this.brands.set(this.sortBrands(formattedData));
    } finally {
      this.isLoading.set(false);
    }
  }

  async createBrand() {
    const data = this.newBrand();
    if (!data.brand || !data.category) return;

    this.isCreating.set(true);
    try {
      const created = await firstValueFrom(this.http.post<Brand>(this.apiUrl, data));
      // Добавляем новый бренд в список и сразу сортируем
      this.brands.update(prev => this.sortBrands([...prev, { ...created, isEditing: false }]));
      // Сброс формы
      this.newBrand.set({ brand: '', price: 0, category: '' });
    } finally {
      this.isCreating.set(false);
    }
  }

  async deleteBrand(id: string) {
    if (!confirm('Удалить эту марку?')) return;
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.brands.update(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      alert('Ошибка при удалении');
    }
  }
  
  // Метод сохранения изменений
  async saveUpdate(brand: Brand) {
    try {
      await firstValueFrom(this.http.post('/api/update-price', { 
          _id: brand._id, 
          price: brand.price,
          brand: brand.brand,     // Передаем обновленное имя
          category: brand.category // И категорию тоже (вдруг опечатались)
      }));
      
      brand.isEditing = false; // Закрываем режим редактирования
      alert('Данные успешно сохранены!');
      
      // На всякий случай пересортируем (если изменилась категория)
      this.brands.update(prev => this.sortBrands([...prev]));
      
    } catch (err) {
      alert('Ошибка при сохранении. Проверьте данные.');
    }
  }

  // Переключатель режима редактирования
  toggleEdit(brand: Brand) {
    brand.isEditing = !brand.isEditing;
  }
}