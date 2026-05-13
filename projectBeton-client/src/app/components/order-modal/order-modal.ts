import { Component, Output, EventEmitter, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../orderService';
import { RecaptchaService } from '../../recaptcha.service';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.less',
})
export class OrderModal {
  @Output() closeModal = new EventEmitter<void>();

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
    private recaptcha: RecaptchaService,
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

  async onSubmit(): Promise<void> {
    this.formMessage.set(null);
    this.formMessageKind.set(null);
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    try {
      const recaptchaToken = await this.recaptcha.execute('order');
      const raw = this.orderForm.value;
      const { consentPdn: _c, ...payload } = raw;
      await this.orderService.sendOrder({ ...payload, recaptchaToken });
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
    } catch {
      this.formMessage.set('Не удалось отправить заказ. Проверьте соединение и попробуйте ещё раз.');
      this.formMessageKind.set('error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
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
