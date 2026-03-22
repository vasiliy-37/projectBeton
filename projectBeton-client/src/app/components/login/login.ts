import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth';
// import { Router } from '@angular/router'; // Можно убрать, если навигация полностью внутри сервиса

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.less']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  private authService = inject(AuthService);
  // private router = inject(Router); // Больше не нужен здесь, если сервис сам делает редирект

  /**
   * Метод, вызываемый при отправке формы
   */
  async onLogin() { // Добавляем async
    this.errorMessage = '';

    try {
      // 🛑 Вызываем метод login и ждем результата
      const response = await this.authService.login({ 
        username: this.username, 
        password: this.password 
      });

      console.log('Вход успешен:', response);
      // Навигация (this.router.navigate) уже происходит внутри AuthService.login

    } catch (err) {
      // 🛑 Блок catch заменяет блок 'error' из subscribe
      console.error('Ошибка входа:', err);
      this.errorMessage = 'Неверный логин или пароль. Попробуйте снова.';
      this.password = '';
    }
  }
}