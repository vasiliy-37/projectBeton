import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-admin-layout',
  standalone: true, 
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.less'
})
export class AdminLayout {
  public chatService = inject(ChatService);
  private authService = inject(AuthService);
  private router = inject(Router); // Переводим на inject для единообразия

  /**
   * Метод для выхода из админ-панели
   */
  async goToPublic() {
    try {
      //  Просто ждем завершения логаута
      await this.authService.logout();
      console.log('Выход выполнен успешно');
    } catch (err) {
      // Если сервер вернул ошибку, просто логируем её
      console.error('Ошибка при запросе на выход, но продолжаем редирект:', err);
    } finally {
      //  В любом случае (успех или ошибка) уводим пользователя на главную
      this.router.navigate(['/']);
    }
  }
}