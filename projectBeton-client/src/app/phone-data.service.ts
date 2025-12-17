import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface PhoneData {
  phoneNumber: string,
  phoneHref: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhoneDataService {
  private apiUrl = '/api/get-phone-number'; 
  
  // Используем inject для HttpClient (современный способ)
  private http = inject(HttpClient);
  
  // WritableSignal для хранения состояния данных
  private _phoneData = signal<PhoneData | undefined>(undefined);
  private _isLoading = signal(false);
  
  // Readonly Сигналы для доступа извне
  readonly phoneData = this._phoneData.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor() {
    // Загружаем данные при инициализации сервиса
    this.loadPhoneData();
  }

  /**
   * Приватный метод для асинхронной загрузки, использующий HttpClient и .toPromise().
   */
  private loadPhoneData(): void {
    this._isLoading.set(true);
    
    // 🛑 Использование .toPromise() преобразует Observable в Promise.
    // Это позволяет нам использовать async/await, избегая явного .subscribe()
    // и всех операторов RxJS в этом месте.
    this.http.get<PhoneData>(this.apiUrl).toPromise() 
      .then(data => {
        // Проверяем, что data не undefined (хотя HttpClient обычно бросает ошибку при неудаче)
        if (data) { 
          this._phoneData.set(data); // Обновляем сигнал
        }
      })
      .catch(error => {
        // Обработка ошибки, как в catchError
        console.error('Failed to load phone data:', error);
        this._phoneData.set(undefined); 
      })
      .finally(() => {
        this._isLoading.set(false);
      });
  }
}