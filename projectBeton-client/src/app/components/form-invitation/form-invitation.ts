import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-invitation',
  imports: [ReactiveFormsModule],
  templateUrl: './form-invitation.html',
  styleUrl: './form-invitation.less'
})
export class FormInvitation {
  @Output() closeModal = new EventEmitter<void>();

  // Инициализация реактивной формы
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required], // Поле "Имя"
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10,}')]] // Поле "Телефон"
    });
  }

  // Метод для обработки отправки формы
  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Форма отправлена:', this.contactForm.value);
      this.contactForm.reset();
      this.closeModal.emit(); // Закрываем окно после успешной отправки
    }
  }
}
