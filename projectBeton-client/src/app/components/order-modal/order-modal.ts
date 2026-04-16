import { Component, Output, EventEmitter, Input } from '@angular/core'; // Используем обычный Input
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../orderService';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.less'
})
export class OrderModal {
  @Output() closeModal = new EventEmitter<void>();

  // Используем сеттеры: как только значение прилетает, оно сразу ставится в форму
  @Input() set volume(val: number | undefined) {
    if (val !== undefined) {
      this.orderForm.patchValue({ quantity: val });
    }
  }

  @Input() set grade(val: string | undefined) {
    if (val !== undefined) {
      this.orderForm.patchValue({ brand: val });
    }
  }

  orderForm: FormGroup;

  constructor(private fb: FormBuilder, private orderService: OrderService) { 
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10,}')]],
      quantity: [null, [Validators.required, Validators.min(0.1)]],
      brand: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.orderForm.valid) {
      try {
        await this.orderService.sendOrder(this.orderForm.value);
        alert('✅ Заказ отправлен!');
        this.orderForm.reset();
        this.closeModal.emit();
      } catch (error) {
        alert('❌ Ошибка отправки');
      }
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}