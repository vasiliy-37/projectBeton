import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- ВАЖНО: Импортируем для работы с [(ngModel)]
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // Регистрируем FormsModule
  templateUrl: './login.html',
  styleUrls: ['./login.less'] // или styleUrl
})
export class LoginComponent {
  // Переменные для привязки к полям ввода
  username = '';
  password = '';
  errorMessage = ''; // Для отображения ошибки пользователю

  // Внедряем сервисы
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Метод, вызываемый при отправке формы
   */
  onLogin() {
    this.errorMessage = ''; // Сбрасываем предыдущие ошибки

    // 1. Вызываем метод login из нашего AuthService
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      // 2. Блок 'next' выполняется, если запрос успешен (мы получили токен)
      next: (response) => {
        console.log('Вход успешен:', response);
        // Перенаправляем администратора на главную страницу админ-панели
        this.router.navigate(['/admin']); 
      },
      // 3. Блок 'error' выполняется, если бэкенд вернул ошибку (например, 401 Unauthorized)
      error: (err) => {
        console.error('Ошибка входа:', err);
        // Отображаем понятное сообщение об ошибке
        this.errorMessage = 'Неверный логин или пароль. Попробуйте снова.';
        // Очищаем пароль для безопасности
        this.password = '';
      }
    });
  }
}