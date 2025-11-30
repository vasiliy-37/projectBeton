import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs';

export interface Brand {
  _id: string;
  brand: string;
  price?: number;
  type?: string;
}

@Component({
  selector: 'app-admin-price',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-price.html',
  styleUrl: './admin-price.less'
})
export class AdminPrice implements OnInit {
  brands: Brand[] = []; 
  isLoading = true;
  error: string | null = null;
  
  // API URLs
  private brandsApiUrl = '/api/brands'; 
  private sandBrandsApiUrl = '/api/sandbrands'; 
  private updatePriceApiUrl = '/api/update-price'; // <-- Новый URL для обновления

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;

    // 1. Запрос бетона
    const brands$ = this.http.get<Brand[]>(this.brandsApiUrl).pipe(
      map(data => data.map(item => ({ ...item, type: 'Бетон' })))
    );

    // 2. Запрос пескобетона
    const sandBrands$ = this.http.get<Brand[]>(this.sandBrandsApiUrl).pipe(
      map(data => data.map(item => ({ ...item, type: 'Пескобетон' })))
    );

    // 3. Объединяем результаты
    forkJoin([brands$, sandBrands$]).subscribe({
      next: ([brandsData, sandBrandsData]) => {
        this.brands = [...brandsData, ...sandBrandsData]; 
        this.isLoading = false;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить все данные.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  
  /**
   * Отправляет обновленную цену на сервер.
   * @param brand Объект Brand с обновленной ценой.
   */
  updatePrice(brand: Brand): void {
    if (brand.price === undefined || brand.price < 0) {
      alert('Пожалуйста, введите корректную цену.');
      return;
    }

    const body = {
      _id: brand._id,
      type: brand.type,
      price: brand.price
    };

    this.http.post(this.updatePriceApiUrl, body).subscribe({
      next: () => {
        alert(`Цена для ${brand.brand} успешно обновлена!`);
      },
      error: (err) => {
        console.error(`Ошибка при обновлении цены для ${brand.brand}:`, err);
        alert(`Не удалось обновить цену для ${brand.brand}.`);
      }
    });
  }
}
