import { Component, Output, EventEmitter, Input, effect, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-order-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.less'
})
export class OrderModal {
  
  @Output() closeModal = new EventEmitter<void>();

  volume = input<number | undefined>(undefined);
  grade = input<string | undefined>(undefined);

  orderForm: FormGroup;

  constructor(private fb: FormBuilder) {
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

  onSubmit(): void {
    if (this.orderForm.valid) {
      console.log('Заказ бетона отправлен:', this.orderForm.value);
      this.orderForm.reset();
      this.closeModal.emit();
    }
  }
}
