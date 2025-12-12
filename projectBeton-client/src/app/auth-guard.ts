import { CanActivateFn} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth'; 
import { tap } from 'rxjs';

/**
 * AuthGuard проверяет авторизацию через запрос к бэкенду.
 * Возвращает Observable<boolean>.
 */
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  
  // Вызываем новый метод, который делает HTTP-запрос
  return authService.checkAuthStatus().pipe(
    // tap() здесь не обязателен, но полезен для отладки
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        // Если checkAuthStatus вернул false (после того, как бэкенд ответил 401), 
        // перенаправление уже произошло в самом AuthService.
        console.log('Доступ заблокирован, перенаправление на логин.');
      }
    })
  );
};