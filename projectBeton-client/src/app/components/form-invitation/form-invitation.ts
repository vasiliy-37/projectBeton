import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../orderService';

@Component({
  selector: 'app-form-invitation',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-invitation.html',
  styleUrl: './form-invitation.less'
})
export class FormInvitation {
  @Output() closeModal = new EventEmitter<void>();

  // Инициализация реактивной формы
  contactForm: FormGroup;

  constructor(private fb: FormBuilder, private orderService: OrderService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required], // Поле "Имя"
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10,}')]] // Поле "Телефон"
    });
  }

  // Метод для обработки отправки формы
  async onSubmit(): Promise<void> {
    if (this.contactForm.valid) {
      const callDetails = this.contactForm.value;

      try {
        // 🛑 Используем await вместо .subscribe()
        const response = await this.orderService.requestCall(callDetails);
        
        // Логика при успешном ответе
        alert('✅ Заявка на звонок успешно отправлена! Ожидайте, мы перезвоним.');
        this.contactForm.reset();
        this.closeModal.emit();

      } catch (error) {
        // 🛑 Обработка ошибок в блоке catch
        console.error('❌ Ошибка отправки заявки:', error);
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
      }
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
