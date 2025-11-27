import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NavigationBar } from '../navigation-bar/navigation-bar';

interface PhoneData {
  phoneNumber: string,
  phoneHref: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLinkActive, RouterLink, NavigationBar],
  templateUrl: './header.html',
  styleUrl: './header.less'
})
export class Header implements OnInit {
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
