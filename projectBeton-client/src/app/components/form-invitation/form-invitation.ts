import {
  Component,
  Output,
  EventEmitter,
  signal,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../orderService';
import { SmartCaptchaService } from '../../smartcaptcha.service';

@Component({
  selector: 'app-form-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-invitation.html',
  styleUrl: './form-invitation.less',
})
export class FormInvitation implements AfterViewInit, OnDestroy {
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('captchaHost') captchaHost?: ElementRef<HTMLElement>;

  protected readonly formMessage = signal<string | null>(null);
  protected readonly formMessageKind = signal<'success' | 'error' | null>(null);
  protected readonly isSubmitting = signal(false);

  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private smartCaptcha: SmartCaptchaService,
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10,}')]],
      consentPdn: [false, Validators.requiredTrue],
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const el = this.captchaHost?.nativeElement;
    if (el) {
      await this.smartCaptcha.initSlot('callback', el);
    }
  }

  ngOnDestroy(): void {
    this.smartCaptcha.destroySlot('callback');
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
      const clientKey = await this.smartCaptcha.resolveClientKey();
      const recaptchaToken = this.smartCaptcha.getToken('callback');
      if (clientKey && !recaptchaToken) {
        this.formMessage.set('Пройдите проверку «Я не робот».');
        this.formMessageKind.set('error');
        return;
      }
      const raw = this.contactForm.value;
      const { consentPdn: _c, ...payload } = raw;
      await this.orderService.requestCall({ ...payload, recaptchaToken });
      this.smartCaptcha.resetSlot('callback');
      this.formMessage.set('Заявка отправлена. Мы перезвоним в рабочее время.');
      this.formMessageKind.set('success');
      this.contactForm.reset({ name: '', phone: '', consentPdn: false });
      setTimeout(() => this.closeModal.emit(), 2200);
    } catch (error: unknown) {
      console.error('Ошибка отправки заявки:', error);
      this.formMessage.set(this.messageFromSubmitError(error));
      this.formMessageKind.set('error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  private messageFromSubmitError(e: unknown): string {
    if (e instanceof Error) {
      if (
        e.message === 'smartcaptcha_script_load_failed' ||
        e.message.includes('smartcaptcha_script_load_failed')
      ) {
        return 'Не удалось загрузить SmartCaptcha (часто мешают блокировщик рекламы или CSP в nginx). Отключите блокировку для этого сайта или попробуйте другой браузер.';
      }
    }
    const err = e as { error?: { message?: string } };
    const serverMsg = err?.error?.message;
    if (typeof serverMsg === 'string' && serverMsg.trim() !== '') {
      return serverMsg;
    }
    return 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.';
  }
}
