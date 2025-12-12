import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive,],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.less'
})
export class AdminLayout {
// 1. Инжектируем AuthService
  private authService = inject(AuthService); // Используем inject() для современного подхода

  // 2. Оставляем Router
  constructor(private router: Router) {}

  goToPublic() {
    // 3. Вызываем logout() и только при успехе переходим на главную
    this.authService.logout().subscribe({
        next: () => {
            console.log('Выход выполнен, перенаправление на главную.');
            this.router.navigate(['/']); // Перенаправляем на /
        },
        error: (err) => {
             // Если произошла ошибка (например, куки уже нет или сервер недоступен), 
             // мы все равно должны перенаправить пользователя на публичный сайт.
            console.error('Ошибка при выходе, но перенаправляем:', err);
            this.router.navigate(['/']); 
        }
    });
  }
}
