import { Component, computed, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OrderButton } from '../order-button/order-button';
import { PhoneDataService } from '../../phone-data.service';

interface Brand {
  _id: string; 
  brand: string; 
  price: number; 
  category: string;
}

interface DeliveryCity {
  _id: string;
  slug: string;
  name: string;
  pricePerM3: number;
  isActive: boolean;
}

interface ServiceItem {
  _id: string;
  category: string;
  name: string;
  price: number;
  unit: string;
}

export interface CalculatorOrderData {
  volume: number;
  grade: string;
  concreteCost: number;
  includeDelivery: boolean;
  deliveryCityName: string;
  deliveryCityPricePerM3: number;
  deliveryBillableVolume: number;
  deliveryCost: number;
  includePump: boolean;
  pumpServiceName: string;
  pumpHours: number;
  pumpCost: number;
  finalTotal: number;
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
  private phoneDataService = inject(PhoneDataService);

  /** Тот же номер, что в шапке (из /api/get-phone-number) */
  readonly callHref = computed(() => this.phoneDataService.phoneData()?.phoneHref ?? '#');

  // Событие для передачи данных в Home
  @Output() orderRequested = new EventEmitter<CalculatorOrderData>();

  allBrands = signal<Brand[]>([]);
  deliveryCities = signal<DeliveryCity[]>([]);
  pumpServices = signal<ServiceItem[]>([]);
  isLoading = signal(true);

  // Источники данных (сигналы)
  selectedCategory = signal('');
  selectedGrade = signal('');
  volumeValue = signal(0);
  includeDelivery = signal(false);
  selectedDeliveryCitySlug = signal('');
  includePump = signal(false);
  selectedPumpServiceId = signal('');
  pumpHours = signal(4);

  form = this.fb.group({
    category: [''],
    grade: [''],
    volume: [null as number | null, [Validators.required, Validators.min(0.1)]],
    includeDelivery: [false],
    deliveryCitySlug: [''],
    includePump: [false],
    pumpServiceId: [''],
    pumpHours: [4, [Validators.min(4)]]
  });

  ngOnInit() {
    this.loadPrices();
  }

  async loadPrices() {
    try {
      const [brandsData, citiesData, servicesData] = await Promise.all([
        firstValueFrom(this.http.get<Brand[]>('/api/brands')),
        firstValueFrom(this.http.get<DeliveryCity[]>('/api/delivery-cities')),
        firstValueFrom(this.http.get<ServiceItem[]>('/api/services'))
      ]);

      this.allBrands.set(brandsData);
      this.deliveryCities.set(citiesData);
      const pumpCandidates = servicesData.filter((service) => this.isPumpWithMeters(service.name));
      this.pumpServices.set(pumpCandidates);

      const patch: {
        category?: string;
        grade?: string;
        deliveryCitySlug?: string;
        pumpServiceId?: string;
      } = {};

      if (brandsData.length > 0) {
        const defaultConcrete =
          brandsData.find((item) => item.category.trim().toLowerCase() === 'товарный бетон') ||
          brandsData.find((item) => item.category.toLowerCase().includes('товарный')) ||
          brandsData[0];

        patch.category = defaultConcrete.category;
        patch.grade = defaultConcrete.brand;
      }

      if (citiesData.length > 0) {
        const defaultCity =
          citiesData.find((city) => city.slug === 'ivanovo') ||
          citiesData.find((city) => city.name.toLowerCase() === 'иваново') ||
          citiesData[0];
        patch.deliveryCitySlug = defaultCity.slug;
      }

      if (pumpCandidates.length > 0) {
        patch.pumpServiceId = pumpCandidates[0]._id;
      }

      if (Object.keys(patch).length > 0) {
        this.form.patchValue(patch);
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
    this.includeDelivery.set(Boolean(val.includeDelivery));
    this.selectedDeliveryCitySlug.set(val.deliveryCitySlug || '');
    this.includePump.set(Boolean(val.includePump));
    this.selectedPumpServiceId.set(val.pumpServiceId || '');
    this.pumpHours.set(Math.max(Number(val.pumpHours) || 0, 4));
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

  selectedDeliveryCity = computed(() =>
    this.deliveryCities().find((city) => city.slug === this.selectedDeliveryCitySlug()) || null
  );

  deliveryBillableVolume = computed(() => Math.max(this.volumeValue(), 7));

  deliveryCost = computed(() => {
    if (!this.includeDelivery()) {
      return 0;
    }
    const city = this.selectedDeliveryCity();
    if (!city) {
      return 0;
    }
    return this.deliveryBillableVolume() * (Number(city.pricePerM3) || 0);
  });

  selectedPumpService = computed(() =>
    this.pumpServices().find((service) => service._id === this.selectedPumpServiceId()) || null
  );

  pumpCost = computed(() => {
    if (!this.includePump()) {
      return 0;
    }
    const service = this.selectedPumpService();
    if (!service) {
      return 0;
    }
    return (Number(service.price) || 0) * this.pumpHours();
  });

  finalTotal = computed(() => this.totalPrice() + this.deliveryCost() + this.pumpCost());

  formatGradeLabel(brandValue: string): string {
    const source = String(brandValue || '').trim();
    const mMatch = source.match(/(?:^|\s)([МM]\s*-?\s*\d+)/i);
    return mMatch?.[1]?.replace(/\s+/g, '') || source;
  }

  private isPumpWithMeters(name: string): boolean {
    const normalized = String(name || '')
      .toLowerCase()
      .replace(/\u00a0/g, ' ')
      .trim();

    return /бетононасос.*\d+\s*(?:[-–]\s*\d+)?\s*[мm]/i.test(normalized);
  }

  // Кнопка "Заказать" теперь просто кидает данные наверх
  onOpenModalClick() {
    const selectedCity = this.selectedDeliveryCity();
    const selectedPump = this.selectedPumpService();

    this.orderRequested.emit({
      volume: this.volumeValue(),
      grade: this.selectedGrade(),
      concreteCost: this.totalPrice(),
      includeDelivery: this.includeDelivery(),
      deliveryCityName: selectedCity?.name || '',
      deliveryCityPricePerM3: Number(selectedCity?.pricePerM3) || 0,
      deliveryBillableVolume: this.deliveryBillableVolume(),
      deliveryCost: this.deliveryCost(),
      includePump: this.includePump(),
      pumpServiceName: selectedPump?.name || '',
      pumpHours: this.pumpHours(),
      pumpCost: this.pumpCost(),
      finalTotal: this.finalTotal()
    });
  }
}