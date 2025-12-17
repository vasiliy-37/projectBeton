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
    return data?.phoneNumber ?? 'Номер недоступен';
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
