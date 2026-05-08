import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const ALLOWED_UNITS = ['руб.', 'руб/м³', 'руб/км', 'руб/час'] as const;
type ServiceUnit = typeof ALLOWED_UNITS[number];

export interface ServiceItem {
  _id: string;
  category: string;
  groupSubtitle?: string;
  name: string;
  price: number;
  unit:ServiceUnit;
}

@Component({
  selector: 'app-service-list',
  imports: [CommonModule],
  templateUrl: './service-list.html',
  styleUrl: './service-list.less'
})
export class ServiceList implements OnInit{
 services: ServiceItem[] = [];
  isLoading = true;
  error: string | null = null;
  private apiUrl = '/api/services'; // Используем прокси

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchServices();
  }

  fetchServices(): void {
    this.http.get<ServiceItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить услуги.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  getGroupedServices(): { category: string; subtitle: string; items: ServiceItem[] }[] {
    const grouped = new Map<string, ServiceItem[]>();
    for (const service of this.services) {
      const key = (service.category || 'Общие услуги').trim();
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(service);
    }

    return Array.from(grouped.entries()).map(([category, items]) => {
      const normalizedCategory = category.toLowerCase();
      const sortedItems = [...items];

      // Только для категории противоморозных добавок сортируем позиции по цене.
      if (normalizedCategory.includes('противомороз')) {
        sortedItems.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      }

      return {
        category,
        subtitle: items.find((it) => (it.groupSubtitle || '').trim())?.groupSubtitle?.trim() || '',
        items: sortedItems
      };
    });
  }
}