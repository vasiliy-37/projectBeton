import { Component, Output, EventEmitter, effect, input } from '@angular/core';
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

  volume = input<number | undefined>(undefined);
  grade = input<string | undefined>(undefined);

  orderForm: FormGroup;

  constructor(private fb: FormBuilder, private orderService: OrderService) { 
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10,}')]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      brand: ['', Validators.required]
    });

    effect(() => {
      this.orderForm.controls['quantity'].setValue(this.volume());
      this.orderForm.controls['brand'].setValue(this.grade());
    });
  }

  async onSubmit(): Promise<void> {
    if (this.orderForm.valid) {
      const orderDetails = this.orderForm.value;

      try {
        // 🛑 Вместо .subscribe() используем await
        const response = await this.orderService.sendOrder(orderDetails);
        
        console.log('Ответ от сервера:', response);
        alert('✅ Ваш заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.');
        
        // Сброс формы и закрытие модального окна
        this.orderForm.reset();
        this.closeModal.emit();

      } catch (error) {
        // 🛑 Обработка ошибок теперь в блоке catch
        console.error('❌ Ошибка при отправке заказа:', error);
        alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте позже.');
      }
    }
  }
}
