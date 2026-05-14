import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface ContactData {
  name: string;
  phone: string;
  /** Опционально: Google reCAPTCHA v3 */
  recaptchaToken?: string;
}

interface OrderData {
  name: string;
  phone: string;
  quantity: number;
  brand: string;
  concreteCost?: number;
  includeDelivery?: boolean;
  deliveryCityName?: string;
  deliveryCityPricePerM3?: number;
  deliveryBillableVolume?: number;
  deliveryCost?: number;
  includePump?: boolean;
  pumpServiceName?: string;
  pumpHours?: number;
  pumpCost?: number;
  finalTotal?: number;
  /** Опционально: Google reCAPTCHA v3 */
  recaptchaToken?: string;
}

// Интерфейс для ответа (предполагаем, что бэкенд возвращает статус)
interface ApiResponse {
    success: boolean;
    message: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseApiUrl = '/api';
  
  private http = inject(HttpClient);

  /**
   * Отправляет данные заказа на бэкенд.
   * @param orderData Объект с данными формы.
   * Возвращает Promise.
   */
  async sendOrder(orderData: OrderData): Promise<ApiResponse> {
    const url = `${this.baseApiUrl}/send-order`;
    return firstValueFrom(this.http.post<ApiResponse>(url, orderData));
  }

  /**
   * Отправляет запрос на обратный звонок.
   * @param contactData Объект с данными контакта.
   * Возвращает Promise.
   */
  async requestCall(contactData: ContactData): Promise<ApiResponse> {
    const url = `${this.baseApiUrl}/request-call`;
    return firstValueFrom(this.http.post<ApiResponse>(url, contactData));
  }
}