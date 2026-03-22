import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Brand {
  _id: string;
  brand: string; 
  price?: number; 
  category: string; // Используем новое поле из БД
}

@Component({
  selector: 'app-brand-list',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './brand-list.html',
  styleUrls: ['./brand-list.less']
})
export class BrandListComponent implements OnInit {
  // Состояние на Сигналах
  brands = signal<Brand[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  private http = inject(HttpClient);
  private brandsApiUrl = '/api/brands'; // Теперь тут ВСЕ категории

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Один простой запрос вместо forkJoin
      const data = await firstValueFrom(this.http.get<Brand[]>(this.brandsApiUrl));
      this.brands.set(data);
    } catch (err) {
      this.error.set('Не удалось загрузить прайс-лист. Попробуйте позже.');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }
}