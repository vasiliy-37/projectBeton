import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, catchError, map } from 'rxjs';

// Интерфейс для данных, которые мы отправляем
interface UserCredentials {
  username: string;
  password: string;
}

// Интерфейс для данных, которые мы получаем от бэкенда
interface LoginResponse {
  token: string;
  message: string;
}

@Injectable({
  // providedIn: 'root' делает сервис доступным во всем приложении
  providedIn: 'root'
})
export class AuthService {
  // Внедрение зависимостей через inject() - современный подход в Angular 20
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // URL вашего бэкенда для входа, совпадает с маршрутом в server.js
  private readonly loginUrl = '/api/login';  

  /**
   * Отправляет запрос на бэкенд для входа и сохраняет токен.
   */
  login(credentials: UserCredentials): Observable<LoginResponse> {
        // Добавляем { withCredentials: true }
        return this.http.post<LoginResponse>(this.loginUrl, credentials, { withCredentials: true })
            .pipe(
                // Токен в куке, ничего сохранять не нужно.
                tap(() => {
                    this.router.navigate(['/admin/contacts']);
                })
            );
    }

    logout(): Observable<any> { 
        // Просто возвращаем Observable, чтобы вызывающий компонент решал, куда навигировать
        return this.http.post('/api/logout', {}, { withCredentials: true });
    }

checkAuthStatus(): Observable<boolean> {
        // Запрос отправляет куку благодаря withCredentials: true
        return this.http.get<{ isAuthenticated: boolean }>('/api/status', { withCredentials: true })
            .pipe(
                // Если запрос успешен (200 OK), значит, пользователь авторизован
                tap(response => console.log('Auth check successful')),
                map(response => response.isAuthenticated),
                // Если запрос падает (401 Unauthorized), перехватываем ошибку
                catchError(err => {
                    console.error('Auth check failed:', err);
                    // Перенаправляем на логин при неудаче
                    this.router.navigate(['/login']);
                    // Возвращаем Observable с false
                    return of(false);
                })
            );
    }
  }