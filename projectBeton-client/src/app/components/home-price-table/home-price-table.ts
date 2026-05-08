import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

  orderedBrands = computed(() =>
    [...this.brands()].sort((a, b) => {
      const categoryOrderDiff = this.getCategoryOrder(a.category) - this.getCategoryOrder(b.category);
      if (categoryOrderDiff !== 0) {
        return categoryOrderDiff;
      }
      const byCategoryName = a.category.localeCompare(b.category, 'ru');
      if (byCategoryName !== 0) {
        return byCategoryName;
      }
      return a.brand.localeCompare(b.brand, 'ru');
    })
  );

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

  formatBrandMain(brandValue: string): string {
    const source = String(brandValue || '').trim();
    const mMatch = source.match(/(?:^|\s)([МM]\s*-?\s*\d+)/i);
    return mMatch?.[1]?.replace(/\s+/g, '') || source;
  }

  formatBrandStrengthClass(brandValue: string): string {
    const source = String(brandValue || '').trim();
    const bMatch = source.match(/(?:^|\s)([ВVB]\s*-?\s*[\d.,]+)/i);
    const fMatch = source.match(/(?:^|\s)(F\s*-?\s*\d+)/i);
    const details = [bMatch?.[1], fMatch?.[1]]
      .filter((part) => !!part)
      .map((part) => String(part).replace(/\s+/g, ''))
      .join(' ');

    return details;
  }

  private getCategoryOrder(category: string): number {
    const normalized = String(category || '').trim().toLowerCase();
    if (normalized.includes('товарный бетон')) {
      return 1;
    }
    if (normalized.includes('пескобетон')) {
      return 2;
    }
    if (normalized === 'раствор' || normalized.includes('раствор')) {
      return 3;
    }
    return 50;
  }
}
