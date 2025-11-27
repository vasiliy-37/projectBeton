import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs'; // <-- Правильный импорт forkJoin
import { map } from 'rxjs/operators'; // <-- Правильный импорт map

// Интерфейс, описывающий структуру данных
export interface Brand {
  _id: string;
  brand: string; 
  price?: number; 
  type?: string; // Дополнительное поле для разделения в шаблоне
}

@Component({
  selector: 'app-brand-list',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './brand-list.html', // Используем ваш путь .html
  styleUrls: ['./brand-list.less'] // Используем ваш путь .less
})
export class BrandListComponent implements OnInit {
  brands: Brand[] = []; // Массив для всех данных (бетон + пескобетон)
  isLoading = true;
  error: string | null = null;
  private brandsApiUrl = '/api/brands'; // URL для бетона (через прокси)
  private sandBrandsApiUrl = '/api/sandbrands'; // URL для пескобетона (через прокси)

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchData(); // Используем новую функцию fetchData
  }

  fetchData(): void {
    this.isLoading = true;

    // 1. Запрос данных по бетону и добавление типа "Бетон"
    const brands$ = this.http.get<Brand[]>(this.brandsApiUrl).pipe(
      map(data => data.map(item => ({ ...item, type: 'Бетон' })))
    );

    // 2. Запрос данных по пескобетону и добавление типа "Пескобетон"
    const sandBrands$ = this.http.get<Brand[]>(this.sandBrandsApiUrl).pipe(
      map(data => data.map(item => ({ ...item, type: 'Пескобетон' })))
    );

    // 3. Объединяем результаты обоих запросов
    forkJoin([brands$, sandBrands$]).subscribe({
      next: ([brandsData, sandBrandsData]) => {
        // Объединяем оба массива в один общий список
        this.brands = [...brandsData, ...sandBrandsData]; 
        this.isLoading = false;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить все данные. Убедитесь, что серверы запущены.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}