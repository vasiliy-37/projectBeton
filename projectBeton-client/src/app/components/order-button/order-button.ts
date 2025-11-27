import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-order-button',
  imports: [],
  templateUrl: './order-button.html',
  styleUrl: './order-button.less'
})
export class OrderButton {
  @Output() openModal = new EventEmitter<void>();
}
