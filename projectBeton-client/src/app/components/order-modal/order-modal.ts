import {
  Component,
  Output,
  EventEmitter,
  Input,
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
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.less',
})
export class OrderModal implements AfterViewInit, OnDestroy {
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('captchaHost') captchaHost?: ElementRef<HTMLElement>;

  protected readonly formMessage = signal<string | null>(null);
  protected readonly formMessageKind = signal<'success' | 'error' | null>(null);
  protected readonly isSubmitting = signal(false);

  summary = {
    concreteCost: 0,
    includeDelivery: false,
    deliveryCityName: '',
    deliveryCityPricePerM3: 0,
    deliveryBillableVolume: 0,
    deliveryCost: 0,
    includePump: false,
    pumpServiceName: '',
    pumpHours: 0,
    pumpCost: 0,
    finalTotal: 0,
  };

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

  @Input() set concreteCost(val: number | undefined) {
    this.summary.concreteCost = Number(val) || 0;
    this.syncSummaryToForm();
  }

  @Input() set includeDelivery(val: boolean | undefined) {
    this.summary.includeDelivery = Boolean(val);
    this.syncSummaryToForm();
  }

  @Input() set deliveryCityName(val: string | undefined) {
    this.summary.deliveryCityName = String(val || '');
    this.syncSummaryToForm();
  }

  @Input() set deliveryCityPricePerM3(val: number | undefined) {
    this.summary.deliveryCityPricePerM3 = Number(val) || 0;
    this.syncSummaryToForm();
  }

  @Input() set deliveryBillableVolume(val: number | undefined) {
    this.summary.deliveryBillableVolume = Number(val) || 0;
    this.syncSummaryToForm();
  }

  @Input() set deliveryCost(val: number | undefined) {
    this.summary.deliveryCost = Number(val) || 0;
    this.syncSummaryToForm();
  }

  @Input() set includePump(val: boolean | undefined) {
    this.summary.includePump = Boolean(val);
    this.syncSummaryToForm();
  }

  @Input() set pumpServiceName(val: string | undefined) {
    this.summary.pumpServiceName = String(val || '');
    this.syncSummaryToForm();
  }

  @Input() set pumpHours(val: number | undefined) {
    this.summary.pumpHours = Number(val) || 0;
    this.syncSummaryToForm();
  }

  @Input() set pumpCost(val: number | undefined) {
    this.summary.pumpCost = Number(val) || 0;
    this.syncSummaryToForm();
  }

  @Input() set finalTotal(val: number | undefined) {
    this.summary.finalTotal = Number(val) || 0;
    this.syncSummaryToForm();
  }

  orderForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private smartCaptcha: SmartCaptchaService,
  ) {
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10,}')]],
      quantity: [null, [Validators.required, Validators.min(0.1)]],
      brand: ['', Validators.required],
      consentPdn: [false, Validators.requiredTrue],
      concreteCost: [0],
      includeDelivery: [false],
      deliveryCityName: [''],
      deliveryCityPricePerM3: [0],
      deliveryBillableVolume: [0],
      deliveryCost: [0],
      includePump: [false],
      pumpServiceName: [''],
      pumpHours: [0],
      pumpCost: [0],
      finalTotal: [0],
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const el = this.captchaHost?.nativeElement;
    if (el) {
      await this.smartCaptcha.initSlot('order', el);
    }
  }

  ngOnDestroy(): void {
    this.smartCaptcha.destroySlot('order');
  }

  async onSubmit(): Promise<void> {
    this.formMessage.set(null);
    this.formMessageKind.set(null);
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    try {
      const clientKey = await this.smartCaptcha.resolveClientKey();
      const recaptchaToken = this.smartCaptcha.getToken('order');
      if (clientKey && !recaptchaToken) {
        this.formMessage.set('Пройдите проверку «Я не робот».');
        this.formMessageKind.set('error');
        return;
      }
      const raw = this.orderForm.value;
      const { consentPdn: _c, ...payload } = raw;
      await this.orderService.sendOrder({ ...payload, recaptchaToken });
      this.smartCaptcha.resetSlot('order');
      this.formMessage.set('Заказ отправлен. Мы свяжемся с вами для уточнения деталей.');
      this.formMessageKind.set('success');
      this.orderForm.reset({
        name: '',
        phone: '',
        quantity: null,
        brand: '',
        consentPdn: false,
        concreteCost: 0,
        includeDelivery: false,
        deliveryCityName: '',
        deliveryCityPricePerM3: 0,
        deliveryBillableVolume: 0,
        deliveryCost: 0,
        includePump: false,
        pumpServiceName: '',
        pumpHours: 0,
        pumpCost: 0,
        finalTotal: 0,
      });
      this.syncSummaryToForm();
    } catch (e: unknown) {
      console.error('Ошибка отправки заказа:', e);
      const msg = this.messageFromSubmitError(e);
      this.formMessage.set(msg);
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
    return 'Не удалось отправить заказ. Проверьте соединение и попробуйте ещё раз.';
  }

  private syncSummaryToForm(): void {
    this.orderForm.patchValue(
      {
        concreteCost: this.summary.concreteCost,
        includeDelivery: this.summary.includeDelivery,
        deliveryCityName: this.summary.deliveryCityName,
        deliveryCityPricePerM3: this.summary.deliveryCityPricePerM3,
        deliveryBillableVolume: this.summary.deliveryBillableVolume,
        deliveryCost: this.summary.deliveryCost,
        includePump: this.summary.includePump,
        pumpServiceName: this.summary.pumpServiceName,
        pumpHours: this.summary.pumpHours,
        pumpCost: this.summary.pumpCost,
        finalTotal: this.summary.finalTotal,
      },
      { emitEvent: false },
    );
  }
}
