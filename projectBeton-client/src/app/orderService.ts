import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ContactData {
  name: string;
  phone: string;
}

// Определение типа данных, которые мы отправляем
interface OrderData {
  name: string;
  phone: string;
  quantity: number;
  brand: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseApiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) { }

  /**
   * Отправляет данные заказа на бэкенд.
   * @param orderData Объект с данными формы.
   */
  sendOrder(orderData: OrderData): Observable<any> {
    // Отправляем на: http://localhost:3000/api/send-order
    return this.http.post(`${this.baseApiUrl}/send-order`, orderData);
  }
requestCall(contactData: ContactData): Observable<any> {
    // Отправляем на: http://localhost:3000/api/request-call
    return this.http.post(`${this.baseApiUrl}/request-call`, contactData);
  }
}