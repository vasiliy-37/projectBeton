import { Component, computed, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OrderButton } from '../order-button/order-button';

interface Brand {
  _id: string; 
  brand: string; 
  price: number; 
  category: string;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderButton],
  templateUrl: './calculator.html',
  styleUrl: './calculator.less'
})
export class Calculator implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // Событие для передачи данных в Home
  @Output() orderRequested = new EventEmitter<{ volume: number, grade: string }>();

  allBrands = signal<Brand[]>([]);
  isLoading = signal(true);

  // Источники данных (сигналы)
  selectedCategory = signal('');
  selectedGrade = signal('');
  volumeValue = signal(0);

  form = this.fb.group({
    category: [''],
    grade: [''],
    volume: [0, [Validators.required, Validators.min(0.1)]]
  });

  ngOnInit() {
    this.loadPrices();
  }

  async loadPrices() {
    try {
      const data = await firstValueFrom(this.http.get<Brand[]>('/api/brands'));
      this.allBrands.set(data);
      if (data.length > 0) {
        const first = data[0];
        this.form.patchValue({ category: first.category, grade: first.brand });
        this.syncSignals();
      }
    } catch (e) {
      console.error('Ошибка загрузки прайса', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Обновляем сигналы из формы
  syncSignals() {
    const val = this.form.getRawValue();
    this.selectedCategory.set(val.category || '');
    this.selectedGrade.set(val.grade || '');
    this.volumeValue.set(Number(val.volume) || 0);
  }

  uniqueCategories = computed(() => [...new Set(this.allBrands().map(b => b.category))]);
  
  filteredBrands = computed(() => 
    this.allBrands().filter(b => b.category === this.selectedCategory())
  );

  totalPrice = computed(() => {
    const brand = this.allBrands().find(b => 
      b.brand === this.selectedGrade() && b.category === this.selectedCategory()
    );
    return brand ? (brand.price * this.volumeValue()) : 0;
  });

  // Кнопка "Заказать" теперь просто кидает данные наверх
  onOpenModalClick() {
    this.orderRequested.emit({
      volume: this.volumeValue(),
      grade: this.selectedGrade()
    });
  }
}