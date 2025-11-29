import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface PhoneData {
  phoneNumber: string,
  phoneHref: string;
}

@Component({
  selector: 'app-phone-display',
  imports: [CommonModule ],
  templateUrl: './phone-display.html',
  styleUrl: './phone-display.less'
})
export class PhoneDisplay implements OnInit {
phoneNumber: string = 'Загрузка...'; 
  phoneHref: string = '#'; 

  // Внедряем HttpClient напрямую в компонент
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getPhoneNumber();
  }

  getPhoneNumber(): void {
    // URL вашего бэкенда. Если вы используете прокси в ng serve, просто '/api/...'
    const apiUrl = '/api/get-phone-number'; 

    this.http.get<PhoneData>(apiUrl).subscribe({
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
