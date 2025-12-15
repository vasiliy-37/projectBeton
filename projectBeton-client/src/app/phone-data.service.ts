import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface PhoneData {
  phoneNumber: string,
  phoneHref: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhoneDataService {
  private apiUrl = '/api/get-phone-number'; // URL вашего бэкенда

  // Внедряем HttpClient в сервис
  constructor(private http: HttpClient) {}

  // Метод, который выполняет HTTP-запрос и возвращает Observable
  getPhoneNumberData(): Observable<PhoneData> {
    return this.http.get<PhoneData>(this.apiUrl);
  }
}