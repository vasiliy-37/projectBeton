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
  onSubmit(): void {
    if (this.contactForm.valid) {
      const callDetails = this.contactForm.value; // Получаем { name, phone }

      // 3. ОТПРАВКА ДАННЫХ ЧЕРЕЗ СЕРВИС
      this.orderService.requestCall(callDetails).subscribe({
        next: (response) => {
          // Успешный ответ от сервера
          alert('✅ Заявка на звонок успешно отправлена! Ожидайте, мы перезвоним.');
          this.contactForm.reset();
          this.closeModal.emit(); // Закрываем окно
        },
        error: (error) => {
          // Ошибка, если сервер вернул 500 или другая проблема сети
          console.error('❌ Ошибка отправки заявки:', error);
          alert('Произошла ошибка при отправке заявки. Пожалуйста, проверьте консоль.');
        }
      });
    }
  }
}
