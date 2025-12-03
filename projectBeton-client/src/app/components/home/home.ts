import { Component, ViewChild } from '@angular/core';
import { Calculator } from '../calculator/calculator';
import { OrderModal } from '../order-modal/order-modal';
import { CommonModule} from '@angular/common';
import { CardsAboutUs } from '../cards-about-us/cards-about-us';

export interface WindowData {
  logoUrl: string;
  caption: string;
}

@Component({
  selector: 'app-home',
  imports: [Calculator, OrderModal, CommonModule, CardsAboutUs],
  templateUrl: './home.html',
  styleUrl: './home.less'
})
export class Home {

  @ViewChild(Calculator) calculator!: Calculator;

  appWindowsData: WindowData[] = [
    { logoUrl: 'assets/logo-klass.png', caption: 'Отдел продаж' },
    { logoUrl: 'assets/logo-zavod.png', caption: 'Отдел поддержки' },
    { logoUrl: 'assets/logo-mixer.png', caption: 'Отдел маркетинга' },
    { logoUrl: 'assets/logo-nasos.png', caption: 'Отдел разработки' }
  ];

// showModalInsteadText = signal(false);

// orderData = signal<{volume: number, price: number} | null>(null);

// hadleOrderRequest(data: { volume: number, price: number}): void {
//   this.orderData.set(data);
//   this.showModalInsteadText.set(true);
// }

// closeModal(): void {
//   this.showModalInsteadText.set(false);
//   this.orderData.set(null);
// }
}

