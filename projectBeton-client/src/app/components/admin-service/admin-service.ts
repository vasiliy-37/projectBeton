import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/core';

export interface ServiceItem {
  _id: string; 
  name: string;
  price: number;
  isSaving: boolean; 
  isEditing: boolean; 
}

@Component({
  selector: 'app-admin-service',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-service.html',
  styleUrl: './admin-service.less'
})
export class AdminService implements OnInit {
  
  // --- Состояние компонента с использованием сигналов ---
  services = signal<ServiceItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  // Состояние формы создания
  newService = signal<Omit<ServiceItem, '_id'| 'isSaving'| 'isEditing'>>({ name: '', price: 0 });
  isCreating = signal(false);
  createError = signal<string | null>(null);

  private apiUrl = '/api/services'; // Эндпоинт для работы с услугами
  private http = inject(HttpClient); // Инъекция HttpClient

  // Computed signal для валидации формы создания (название должно быть и цена > 0)
  isNewServiceValid = computed(() => 
    !!this.newService().name && this.newService().price > 0
  );
  
  // --- Вспомогательные методы для работы с ngModel и сигналами ---

  // Обновление названия новой услуги
  onNewServiceNameChange(name: string) {
    this.newService.update(s => ({ ...s, name }));
  }

  // Обновление цены новой услуги
  onNewServicePriceChange(price: number) {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    this.newService.update(s => ({ ...s, price: isNaN(numericPrice) ? 0 : numericPrice }));
  }

  ngOnInit(): void {
    this.fetchServices();
  }

  // Для оптимизации рендеринга в ngFor
  trackByServiceId(index: number, item: ServiceItem): string {
    return item._id;
  }

  // --- CRUD: READ (Чтение/Загрузка) ---
  fetchServices(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.http.get<ServiceItem[]>(this.apiUrl)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          // Инициализируем флаги состояния для каждого элемента
          this.services.set(data.map(s => ({ ...s, isSaving: false, isEditing: false })));
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Не удалось загрузить услуги. Проверьте, запущен ли сервер Express.js.');
          console.error('Ошибка загрузки:', err);
        }
      });
  }

  // --- CRUD: CREATE (Создание) ---
  createService(): void {
    this.isCreating.set(true);
    this.createError.set(null);
    
    if (!this.isNewServiceValid()) {
      this.isCreating.set(false);
      return;
    }

    this.http.post<ServiceItem>(this.apiUrl, this.newService())
      .pipe(
        finalize(() => this.isCreating.set(false))
      )
      .subscribe({
        next: (service) => {
          console.log(`Услуга "${service.name}" успешно создана.`);
          // Добавляем новую услугу в массив сигналов
          this.services.update(services => [
            ...services, 
            { ...service, isSaving: false, isEditing: false }
          ]);
          // Сброс формы
          this.newService.set({ name: '', price: 0 }); 
        },
        error: (err: HttpErrorResponse) => {
          this.createError.set(`Ошибка при создании услуги: ${err.message}`);
          console.error('Ошибка создания:', err);
        }
      });
  }
  
  // --- CRUD: UPDATE (Обновление/Редактирование) ---
  updateService(service: ServiceItem): void {
    // Установка флага isSaving для текущей строки
    this.services.update(services => services.map(s => 
      s._id === service._id ? { ...s, isSaving: true } : s
    ));

    const body = { name: service.name, price: service.price };

    this.http.put<ServiceItem>(`${this.apiUrl}/${service._id}`, body)
      .pipe(
        finalize(() => {
          // Снятие флагов сохранения и редактирования
          this.services.update(services => services.map(s => 
            s._id === service._id ? { ...s, isSaving: false, isEditing: false } : s
          ));
        })
      )
      .subscribe({
        next: () => {
          console.log(`Услуга "${service.name}" успешно обновлена.`);
        },
        error: (err: HttpErrorResponse) => {
          console.error(`Не удалось обновить услугу "${service.name}".`, err);
        }
      });
  }
  
  // --- CRUD: DELETE (Удаление) ---
  deleteService(service: ServiceItem): void {
    // Используем window.confirm для подтверждения
    if (!window.confirm(`Выверены, что хотите удалить услугу: "${service.name}"?`)) {
      return;
    }
    
    // Установка флага isSaving для текущей строки
    this.services.update(services => services.map(s => 
      s._id === service._id ? { ...s, isSaving: true } : s
    ));

    this.http.delete(`${this.apiUrl}/${service._id}`)
      .pipe(
        finalize(() => {
          // Снятие флага isSaving в случае ошибки
          this.services.update(services => services.map(s => 
            s._id === service._id ? { ...s, isSaving: false } : s
          ));
        })
      )
      .subscribe({
        next: () => {
          console.log(`Услуга "${service.name}" успешно удалена.`);
          // Удаление услуги из локального массива сигналов
          this.services.update(services => services.filter(s => s._id !== service._id));
        },
        error: (err: HttpErrorResponse) => {
          console.error(`Не удалось удалить услугу "${service.name}".`, err);
        }
      });
  }
  
  // Вспомогательный метод для переключения режима редактирования
  toggleEdit(service: ServiceItem): void {
    this.services.update(services => services.map(s => 
      s._id === service._id ? { ...s, isEditing: !s.isEditing } : s
    ));
  }
}