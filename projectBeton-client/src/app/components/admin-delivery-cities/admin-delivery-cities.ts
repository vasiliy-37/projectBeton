import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface DeliveryCity {
  _id?: string;
  slug: string;
  name: string;
  cityPrepositional: string;
  district: string;
  pricePerM3: number;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-delivery-cities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-delivery-cities.html',
  styleUrl: './admin-delivery-cities.less'
})
export class AdminDeliveryCities {
  private readonly http = inject(HttpClient);

  cities: DeliveryCity[] = [];
  draft: DeliveryCity = this.createEmptyDraft();
  isSaving = false;

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.http.get<DeliveryCity[]>('/api/admin/delivery-cities').subscribe({
      next: (cities) => {
        this.cities = cities ?? [];
      },
      error: (err) => {
        console.error('Ошибка загрузки городов доставки:', err);
        alert('Не удалось загрузить города доставки.');
      }
    });
  }

  saveCity(city: DeliveryCity): void {
    if (!city._id) {
      return;
    }

    this.http.put(`/api/admin/delivery-cities/${city._id}`, this.toPayload(city)).subscribe({
      next: () => this.loadCities(),
      error: (err) => {
        console.error('Ошибка сохранения города:', err);
        alert(err?.error?.error || 'Не удалось сохранить изменения.');
      }
    });
  }

  deleteCity(city: DeliveryCity): void {
    if (!city._id) {
      return;
    }
    if (!confirm(`Удалить город "${city.name}"?`)) {
      return;
    }

    this.http.delete(`/api/admin/delivery-cities/${city._id}`).subscribe({
      next: () => this.loadCities(),
      error: (err) => {
        console.error('Ошибка удаления города:', err);
        alert(err?.error?.error || 'Не удалось удалить город.');
      }
    });
  }

  createCity(): void {
    if (this.isSaving) {
      return;
    }
    this.isSaving = true;

    this.http.post('/api/admin/delivery-cities', this.toPayload(this.draft)).subscribe({
      next: () => {
        this.draft = this.createEmptyDraft();
        this.loadCities();
      },
      error: (err) => {
        console.error('Ошибка добавления города:', err);
        alert(err?.error?.error || 'Не удалось добавить город.');
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  private createEmptyDraft(): DeliveryCity {
    return {
      slug: '',
      name: '',
      cityPrepositional: '',
      district: '',
      pricePerM3: 0,
      isActive: true
    };
  }

  private toPayload(city: DeliveryCity): DeliveryCity {
    const normalizedName = city.name.trim();
    const normalizedSlug = (city.slug || normalizedName)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    return {
      ...city,
      name: normalizedName,
      slug: normalizedSlug,
      cityPrepositional: city.cityPrepositional?.trim() || normalizedName,
      district: city.district?.trim() || 'Ивановской области',
      pricePerM3: Number(city.pricePerM3) || 0,
      isActive: city.isActive !== false
    };
  }
}
