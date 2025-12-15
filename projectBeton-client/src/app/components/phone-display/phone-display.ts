import { Component, OnInit } from '@angular/core';
import { PhoneDataService } from '../../phone-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phone-display',
  imports: [CommonModule ],
  templateUrl: './phone-display.html',
  styleUrl: './phone-display.less'
})
export class PhoneDisplay implements OnInit {
  
phoneNumber: string = 'Загрузка...'; 
  phoneHref: string = '#'; 

  // Внедряем только наш сервис с данными
  constructor(private phoneDataService: PhoneDataService) {}

  ngOnInit(): void {
    this.phoneDataService.getPhoneNumberData().subscribe({
      next: data => {
        this.phoneNumber = data.phoneNumber;
        this.phoneHref = data.phoneHref;
      },
      error: err => {
        console.error('Ошибка загрузки номера телефона:', err);
        this.phoneNumber = 'Номер недоступен';
        this.phoneHref = '#';
      }
    });
  }
}
