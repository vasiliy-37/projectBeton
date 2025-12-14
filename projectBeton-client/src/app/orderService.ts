import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private apiUrl = 'http://localhost:3000/api/send-order'; 

  constructor(private http: HttpClient) { }

  /**
   * Отправляет данные заказа на бэкенд.
   * @param orderData Объект с данными формы.
   */
  sendOrder(orderData: OrderData): Observable<any> {
    // В Angular 20+, HttpClient автоматически сериализует объект в JSON
    return this.http.post(this.apiUrl, orderData);
  }
}