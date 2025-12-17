import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs'; // Используем для чистого преобразования в Promise

interface UserCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly loginUrl = '/api/login';
  private readonly statusUrl = '/api/status';
  private readonly logoutUrl = '/api/logout';

  // 🛑 Состояние авторизации теперь в Сигнале
  // К нему можно будет обращаться из любого компонента: authService.isAuthenticated()
  private _isAuthenticated = signal<boolean>(false);
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  /**
   * Вход в систему
   */
  async login(credentials: UserCredentials): Promise<LoginResponse> {
    try {
      // firstValueFrom — это современный способ превратить Observable в Promise (лучше чем toPromise)
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(this.loginUrl, credentials, { withCredentials: true })
      );

      this._isAuthenticated.set(true); // Обновляем состояние
      this.router.navigate(['/admin/contacts']);
      return response;
    } catch (error) {
      this._isAuthenticated.set(false);
      throw error;
    }
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(this.logoutUrl, {}, { withCredentials: true })
      );
      this._isAuthenticated.set(false);
      this.router.navigate(['/login']);
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      this._isAuthenticated.set(false);
      throw error;
    }
  }

  /**
   * Проверка статуса (используется в Guard и при старте приложения)
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ isAuthenticated: boolean }>(this.statusUrl, { withCredentials: true })
      );
      
      const isAuth = response.isAuthenticated;
      this._isAuthenticated.set(isAuth); // Синхронизируем сигнал с ответом бэкенда
      return isAuth;
    } catch (err) {
      console.error('Auth check failed:', err);
      this._isAuthenticated.set(false);
      this.router.navigate(['/login']);
      return false;
    }
  }
}