import { Component, ViewChild } from '@angular/core';
import { Calculator } from '../calculator/calculator';
import { OrderModal } from '../order-modal/order-modal';
import { CommonModule, CurrencyPipe, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [Calculator, OrderModal, CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.less'
})
export class Home {

  @ViewChild(Calculator) calculator!: Calculator;

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

