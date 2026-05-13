import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../orderService';
import { RecaptchaService } from '../../recaptcha.service';

@Component({
  selector: 'app-form-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-invitation.html',
  styleUrl: './form-invitation.less',
})
export class FormInvitation {
  @Output() closeModal = new EventEmitter<void>();

  protected readonly formMessage = signal<string | null>(null);
  protected readonly formMessageKind = signal<'success' | 'error' | null>(null);
  protected readonly isSubmitting = signal(false);

  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private recaptcha: RecaptchaService,
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10,}')]],
      consentPdn: [false, Validators.requiredTrue],
    });
  }

  async onSubmit(): Promise<void> {
    this.formMessage.set(null);
    this.formMessageKind.set(null);
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    try {
      const recaptchaToken = await this.recaptcha.execute('callback');
      const raw = this.contactForm.value;
      const { consentPdn: _c, ...payload } = raw;
      await this.orderService.requestCall({ ...payload, recaptchaToken });
      this.formMessage.set('Заявка отправлена. Мы перезвоним в рабочее время.');
      this.formMessageKind.set('success');
      this.contactForm.reset({ name: '', phone: '', consentPdn: false });
      setTimeout(() => this.closeModal.emit(), 2200);
    } catch (error) {
      console.error('Ошибка отправки заявки:', error);
      this.formMessage.set('Не удалось отправить заявку. Попробуйте позже или позвоните нам.');
      this.formMessageKind.set('error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
