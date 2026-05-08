import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom } from 'rxjs'; // Единственный импорт для конвертации

const ALLOWED_UNITS = ['руб.', 'руб/м³', 'руб/км', 'руб/час'] as const;
type ServiceUnit = typeof ALLOWED_UNITS[number];

export interface ServiceItem {
  _id: string; 
  category: string;
  groupSubtitle: string;
  name: string;
  price: number;
  unit: ServiceUnit;
  isSaving: boolean; 
  isEditing: boolean; 
}

@Component({
  selector: 'app-admin-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-service.html',
  styleUrl: './admin-service.less'
})
export class AdminService implements OnInit {
  
  // --- Состояние компонента ---
  services = signal<ServiceItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  newService = signal<Omit<ServiceItem, '_id'| 'isSaving'| 'isEditing'>>({ category: '', groupSubtitle: '', name: '', price: 0, unit: 'руб.'});
  isCreating = signal(false);
  createError = signal<string | null>(null);

  readonly allowedUnits = ALLOWED_UNITS;
  private apiUrl = '/api/services';
  private http = inject(HttpClient);

  isNewServiceValid = computed(() => 
    !!this.newService().category && !!this.newService().name && this.newService().price >= 0
  );
  
  ngOnInit(): void {
    this.fetchServices();
  }

  // --- CRUD: READ ---
  async fetchServices() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.http.get<ServiceItem[]>(this.apiUrl));
      this.services.set(data.map(s => ({ 
        ...s,
        category: s.category || 'Общие услуги',
        groupSubtitle: s.groupSubtitle || '',
        unit: s.unit || 'руб.',
        isSaving: false,
        isEditing: false 
      })));
    } catch (err) {
      this.error.set('Не удалось загрузить услуги.');
      console.error('Ошибка загрузки:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- CRUD: CREATE ---
  async createService() {
    if (!this.isNewServiceValid()) return;

    this.isCreating.set(true);
    this.createError.set(null);

    try {
      const service = await firstValueFrom(this.http.post<ServiceItem>(this.apiUrl, this.newService()));
      
      this.services.update(services => [
        ...services, 
        { ...service, isSaving: false, isEditing: false }
      ]);
      this.newService.set({ category: '', groupSubtitle: '', name: '', price: 0, unit: 'руб.'}); 
    } catch (err: any) {
      this.createError.set(`Ошибка при создании услуги: ${err.message}`);
    } finally {
      this.isCreating.set(false);
    }
  }
  
  // --- CRUD: UPDATE ---
  async updateService(service: ServiceItem) {
    // Ставим флаг загрузки для конкретной строки
    this.setServiceState(service._id, { isSaving: true });

    try {
      const body = {
        category: service.category,
        groupSubtitle: service.groupSubtitle,
        name: service.name,
        price: service.price,
        unit: service.unit
      };
      await firstValueFrom(this.http.put<ServiceItem>(`${this.apiUrl}/${service._id}`, body));
      
      this.setServiceState(service._id, { isSaving: false, isEditing: false });
      console.log(`Услуга "${service.name}" обновлена.`);
    } catch (err) {
      console.error('Ошибка обновления:', err);
      this.setServiceState(service._id, { isSaving: false });
    }
  }
  
  // --- CRUD: DELETE ---
  async deleteService(service: ServiceItem) {
    if (!window.confirm(`Удалить услугу: "${service.name}"?`)) return;
    
    this.setServiceState(service._id, { isSaving: true });

    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${service._id}`));
      this.services.update(services => services.filter(s => s._id !== service._id));
    } catch (err) {
      console.error('Ошибка удаления:', err);
      this.setServiceState(service._id, { isSaving: false });
    }
  }

  // Вспомогательный метод для обновления состояния конкретной услуги в массиве
  private setServiceState(id: string, partial: Partial<ServiceItem>) {
    this.services.update(services => services.map(s => 
      s._id === id ? { ...s, ...partial } : s
    ));
  }

  toggleEdit(service: ServiceItem): void {
    this.setServiceState(service._id, { isEditing: !service.isEditing });
  }

  trackByServiceId(index: number, item: ServiceItem): string {
    return item._id;
  }

  // Методы обновления полей формы (оставляем как есть или переводим на прямое обновление в HTML)
  onNewServiceCategoryChange(category: string) { this.newService.update(s => ({ ...s, category })); }
  onNewServiceGroupSubtitleChange(groupSubtitle: string) { this.newService.update(s => ({ ...s, groupSubtitle })); }
  onNewServiceNameChange(name: string) { this.newService.update(s => ({ ...s, name })); }
  onNewServicePriceChange(price: number) {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    this.newService.update(s => ({ ...s, price: isNaN(num) ? 0 : num }));
  }
  onNewServiceUnitChange(unit: string) { this.newService.update(s => ({ ...s, unit: unit as ServiceUnit })); }
}