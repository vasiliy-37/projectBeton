import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Brand {
  _id: string;
  brand: string;
  price?: number;
  category: string;
}

@Component({
  selector: 'app-home-price-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-price-table.html',
  styleUrl: './home-price-table.less'
})
export class HomePriceTable implements OnInit {
  private http = inject(HttpClient);
  private brandsApiUrl = '/api/brands';

  brands = signal<Brand[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<Brand[]>(this.brandsApiUrl));
      this.brands.set(data);
    } catch (e) {
      console.error(e);
      this.error.set('Не удалось загрузить прайс-лист. Попробуйте позже.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
