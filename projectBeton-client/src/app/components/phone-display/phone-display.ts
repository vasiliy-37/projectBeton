import { Component, OnInit, computed } from '@angular/core';
import { PhoneDataService } from '../../phone-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phone-display',
  imports: [CommonModule ],
  templateUrl: './phone-display.html',
  styleUrl: './phone-display.less'
})
export class PhoneDisplay implements OnInit {
  private formatPhone(rawPhone: string): string {
    const digits = rawPhone.replace(/\D/g, '');

    // Ivanovo landline with country/trunk code: +7(4932)494939 / 8(4932)494939
    if (
      digits.length === 11 &&
      (digits.startsWith('74932') || digits.startsWith('84932'))
    ) {
      return `+7 (4932) ${digits.slice(5, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }

    // RU format: +7 (999) 123-45-67
    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
      const normalized = `7${digits.slice(1)}`;
      return `+${normalized[0]} (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
    }

    // Ivanovo city short number: 49-49-39 -> +7 (4932) 49-49-39
    if (digits.length === 6) {
      return `+7 (4932) ${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
    }

    // City number with area code but without country: 4932494939 -> +7 (4932) 49-49-39
    if (digits.length === 10 && digits.startsWith('4932')) {
      return `+7 (${digits.slice(0, 4)}) ${digits.slice(4, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    }

    return rawPhone;
  }
  
  // 🛑 1. Убираем изменяемые свойства
  // phoneNumber: string = 'Загрузка...'; // <-- УДАЛЯЕМ
  // phoneHref: string = '#';           // <-- УДАЛЯЕМ

  // 🛑 2. Вводим реактивные свойства с помощью computed()
  // Используем сигналы из сервиса для автоматического обновления значений
  
  readonly displayPhoneNumber = computed(() => {
    // Получаем текущее состояние загрузки и данные из сервиса
    const isLoading = this.phoneDataService.isLoading();
    const data = this.phoneDataService.phoneData();

    if (isLoading) {
      return 'Загрузка...';
    }
    // Если данные есть, берем номер; иначе — сообщение об ошибке
    return data?.phoneNumber ? this.formatPhone(data.phoneNumber) : 'Номер недоступен';
  });
  
  readonly phoneHref = computed(() => {
    // Если данные есть, берем ссылку; иначе — '#'
    return this.phoneDataService.phoneData()?.phoneHref ?? '#';
  });

  // Внедряем наш сервис с данными
  constructor(private phoneDataService: PhoneDataService) {}

  ngOnInit(): void {
  //   this.phoneDataService.getPhoneNumberData().subscribe({
  //     next: data => {
  //       this.phoneNumber = data.phoneNumber;
  //       this.phoneHref = data.phoneHref;
  //     },
  //     error: err => {
  //       console.error('Ошибка загрузки номера телефона:', err);
  //       this.phoneNumber = 'Номер недоступен';
  //       this.phoneHref = '#';
  //     }
  //   });
  }
}
