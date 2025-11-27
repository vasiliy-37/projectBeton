import { Component, computed, EventEmitter, Output, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderButton } from '../order-button/order-button';
import { OrderModal } from '../order-modal/order-modal';

@Component({
  selector: 'app-calculator',
  imports: [CommonModule, ReactiveFormsModule, OrderButton, OrderModal],
  templateUrl: './calculator.html',
  styleUrl: './calculator.less'
})
export class Calculator {
  private fb = new FormBuilder();

  // @Output() orderClicked = new EventEmitter<{volume: number, price: number}>();

  pricePerCubicMeter = {
    'M100': 3500,
    'M200': 4000,
    'M300': 4500,
    'M400': 5000.
  };

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  volumeInputMethod = signal<'manual' | 'calc'>('manual');

  manualVolumeForm = this.fb.group({
    volume: [0, [Validators.required, Validators.min(0)]]
  })

  volumeCalculatorForm = this.fb.group({
    length: [0, [Validators.required, Validators.min(0)]],
    width: [0, [Validators.required, Validators.min(0)]],
    height: [0, [Validators.required, Validators.min(0)]],
  })

  concreteGradeForm = this.fb.group({
    grade: ['M200', [Validators.required]]
  })

  manualVolume = toSignal(this.manualVolumeForm.controls.volume.valueChanges, { initialValue: 0 });
  volumeDimensions = toSignal(this.volumeCalculatorForm.valueChanges, { initialValue: { length: 0, width: 0, height: 0 } });
  selectedGrade = toSignal(this.concreteGradeForm.controls.grade.valueChanges, { initialValue: 'M200' });

   calculatedVolume = computed(() => {
  const dimensions = this.volumeDimensions();
  return (dimensions.length ?? 0) * (dimensions.width ?? 0) * (dimensions.height ?? 0);
});

  finalVolume = computed(() => {
    if (this.volumeInputMethod() === 'manual') {
      return this.manualVolume() || 0;
    } else {
      return this.calculatedVolume();
    }
  });

  totalPrice = computed(() => {
    const grade = this.selectedGrade();
    const volume = this.finalVolume();
    const price = grade ? this.pricePerCubicMeter[grade as keyof typeof this.pricePerCubicMeter] : 0;
    return volume * price;
  });

  changeInputMethod(method: 'manual' | 'calc') {
    this.volumeInputMethod.set(method);
  }

  // onOpenModalClick(): void {
  //   this.orderClicked.emit({
  //     volume: this.finalVolume(),
  //     price: this.totalPrice()
  //   });
  // }

  openModalClick = signal(false);
  
  onOpenModalClick(): void {
    this.openModalClick.set(true);
  }

  closeOpenModalClick(): void {
    this.openModalClick.set(false)
  }
}
