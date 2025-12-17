import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth'; 

/**
 * AuthGuard проверяет авторизацию через запрос к бэкенду.
 * Теперь это асинхронная функция, возвращающая Promise<boolean>.
 */
export const AuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  
  // 🛑 Просто ждем результат выполнения checkAuthStatus.
  // Напомним: внутри AuthService уже есть логика редиректа на /login, если вернулось false.
  const isAuthenticated = await authService.checkAuthStatus();

  if (!isAuthenticated) {
    console.log('Доступ заблокирован: пользователь не авторизован.');
  }

  return isAuthenticated;
};