import { Component, signal } from '@angular/core'; // Добавил signal
import { Calculator } from '../calculator/calculator';
import { OrderModal } from '../order-modal/order-modal';
import { CommonModule } from '@angular/common';
import { CardsAboutUs } from '../cards-about-us/cards-about-us';

export interface WindowData {
  logoUrl: string;
  caption: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Calculator, OrderModal, CommonModule, CardsAboutUs],
  templateUrl: './home.html',
  styleUrl: './home.less'
})
export class Home {
  // Состояние модалки и данных заказа
  showModal = signal(false);
  orderData = signal<{ volume: number, grade: string } | null>(null);

  appWindowsData: WindowData[] = [
    { logoUrl: 'assets/logo-klass.png', caption: 'Отдел продаж' },
    { logoUrl: 'assets/logo-zavod.png', caption: 'Отдел логистики' }, // Поменял для смысла
    { logoUrl: 'assets/logo-mixer.png', caption: 'Доставка' },
    { logoUrl: 'assets/logo-nasos.png', caption: 'Бетононасосы' }
  ];

  // Метод, который вызывается, когда калькулятор "кричит" orderRequested
  handleOrderRequest(data: { volume: number, grade: string }): void {
    this.orderData.set(data);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.orderData.set(null);
  }
}