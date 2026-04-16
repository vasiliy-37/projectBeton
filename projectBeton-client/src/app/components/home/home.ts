import { Component, signal } from '@angular/core'; // Добавил signal
import { Calculator } from '../calculator/calculator';
import { OrderModal } from '../order-modal/order-modal';
import { CommonModule } from '@angular/common';
import { Portfolio } from '../portfolio/portfolio';
import { HomeGradeGuide } from '../home-grade-guide/home-grade-guide';
import { HomePriceTable } from '../home-price-table/home-price-table';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Calculator, OrderModal, CommonModule, Portfolio, HomeGradeGuide, HomePriceTable],
  templateUrl: './home.html',
  styleUrl: './home.less'
})
export class Home {
  // Состояние модалки и данных заказа
  showModal = signal(false);
  orderData = signal<{ volume: number, grade: string } | null>(null);

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