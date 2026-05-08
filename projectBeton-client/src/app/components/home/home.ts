import { Component, signal } from '@angular/core'; // Добавил signal
import { Calculator, CalculatorOrderData } from '../calculator/calculator';
import { OrderModal } from '../order-modal/order-modal';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../portfolio/portfolio';
import { HomeGradeGuide } from '../home-grade-guide/home-grade-guide';
import { HomePriceTable } from '../home-price-table/home-price-table';
import { CITY_LANDING_DATA } from '../city-landing/city-landing.data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Calculator, OrderModal, CommonModule, RouterLink, Portfolio, HomeGradeGuide, HomePriceTable],
  templateUrl: './home.html',
  styleUrl: './home.less'
})
export class Home {
  readonly cityLinks = CITY_LANDING_DATA;

  // Состояние модалки и данных заказа
  showModal = signal(false);
  orderData = signal<CalculatorOrderData | null>(null);

  // Метод, который вызывается, когда калькулятор "кричит" orderRequested
  handleOrderRequest(data: CalculatorOrderData): void {
    this.orderData.set(data);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.orderData.set(null);
  }
}