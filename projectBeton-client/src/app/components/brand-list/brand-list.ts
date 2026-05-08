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

interface BrandSegments {
  m: string | null;
  b: string | null;
  f: string | null;
  rest: string;
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
  private categoryPriority: Record<string, number> = {
    'товарный бетон': 1,
    'пескобетон и раствор': 99
  };

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

  parseBrand(brand: string): BrandSegments {
    const source = String(brand || '').trim();
    const mMatch = source.match(/(?:^|\s)([МM]\s*-?\s*\d+)/i);
    const bMatch = source.match(/(?:^|\s)([ВVB]\s*-?\s*[\d.,]+)/i);
    const fMatch = source.match(/(?:^|\s)(F\s*-?\s*\d+)/i);

    const m = mMatch?.[1]?.replace(/\s+/g, '') ?? null;
    const b = bMatch?.[1]?.replace(/\s+/g, '') ?? null;
    const f = fMatch?.[1]?.replace(/\s+/g, '') ?? null;

    let rest = source;
    if (mMatch?.[1]) {
      rest = rest.replace(mMatch[1], '').trim();
    }
    if (bMatch?.[1]) {
      rest = rest.replace(bMatch[1], '').trim();
    }
    if (fMatch?.[1]) {
      rest = rest.replace(fMatch[1], '').trim();
    }

    return { m, b, f, rest };
  }

  formatBrandDisplay(brand: string): string {
    const segments = this.parseBrand(brand);
    const tail = [segments.b, segments.f, segments.rest].filter((part) => !!part).join(' ').trim();

    if (segments.m && tail) {
      return `${segments.m} — ${tail}`;
    }

    return brand;
  }

  formatBrandMain(brand: string): string {
    const segments = this.parseBrand(brand);
    return segments.m || brand;
  }

  formatBrandDetails(brand: string): string {
    const segments = this.parseBrand(brand);
    const details = [segments.b, segments.f, segments.rest].filter((part) => !!part).join(' ').trim();
    return details || '—';
  }

  hasStrengthClass(brand: string): boolean {
    const segments = this.parseBrand(brand);
    return Boolean(segments.b || segments.f || segments.rest);
  }

  getGroupedBrands(): { category: string; items: Brand[]; showStrengthColumn: boolean }[] {
    const map = new Map<string, Brand[]>();
    for (const item of this.brands()) {
      const key = item.category || 'Без категории';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => this.getCategoryOrder(a) - this.getCategoryOrder(b))
      .map(([category, items]) => ({
        category,
        items,
        showStrengthColumn: items.some((it) => this.hasStrengthClass(it.brand))
      }));
  }

  private getCategoryOrder(category: string): number {
    const normalized = category.trim().toLowerCase();
    if (normalized in this.categoryPriority) {
      return this.categoryPriority[normalized];
    }
    return 50;
  }
}