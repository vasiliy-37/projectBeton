import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Brand {
  _id: string;
  brand: string;
  price?: number;
  type?: string;
}

@Component({
  selector: 'app-admin-price',
  standalone: true,
  imports: [ FormsModule],
  templateUrl: './admin-price.html',
  styleUrl: './admin-price.less'
})
export class AdminPrice implements OnInit {
  // --- Состояние на Сигналах ---
  brands = signal<Brand[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  private brandsApiUrl = '/api/brands'; 
  private sandBrandsApiUrl = '/api/sandbrands'; 
  private updatePriceApiUrl = '/api/update-price';

  private http = inject(HttpClient);

  ngOnInit(): void {
    this.fetchData();
  }

  /**
   * Загрузка данных: заменяем forkJoin на Promise.all
   */
  async fetchData() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Запускаем оба запроса параллельно
      const [concrete, sand] = await Promise.all([
        firstValueFrom(this.http.get<Brand[]>(this.brandsApiUrl)),
        firstValueFrom(this.http.get<Brand[]>(this.sandBrandsApiUrl))
      ]);

      // Обрабатываем данные (добавляем типы) и объединяем
      const combined = [
        ...concrete.map(item => ({ ...item, type: 'Бетон' })),
        ...sand.map(item => ({ ...item, type: 'Пескобетон' }))
      ];

      this.brands.set(combined);
    } catch (err) {
      this.error.set('Не удалось загрузить все данные.');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Обновление цены: заменяем .subscribe на async/await
   */
  async updatePrice(brand: Brand) {
    if (brand.price === undefined || brand.price < 0) {
      alert('Пожалуйста, введите корректную цену.');
      return;
    }

    const body = {
      _id: brand._id,
      type: brand.type,
      price: brand.price
    };

    try {
      await firstValueFrom(this.http.post(this.updatePriceApiUrl, body));
      alert(`Цена для ${brand.brand} успешно обновлена!`);
    } catch (err) {
      console.error(`Ошибка при обновлении цены для ${brand.brand}:`, err);
      alert(`Не удалось обновить цену для ${brand.brand}.`);
    }
  }
}