import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ContactData {
  name: string;
  phone: string;
}

interface OrderData {
  name: string;
  phone: string;
  quantity: number;
  brand: string;
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

  private baseApiUrl = 'http://localhost:3000/api'; 
  
  private http = inject(HttpClient);

  /**
   * Отправляет данные заказа на бэкенд.
   * @param orderData Объект с данными формы.
   * Возвращает Promise.
   */
  async sendOrder(orderData: OrderData): Promise<ApiResponse> {
    const url = `${this.baseApiUrl}/send-order`;
    
    // 🛑 Используем .toPromise() для конвертации Observable в Promise
    try {
        const response = await this.http.post<ApiResponse>(url, orderData).toPromise();
        // В случае успеха возвращаем ответ бэкенда
        return response as ApiResponse;
    } catch (error) {
        // В случае HTTP-ошибки пробрасываем ее
        throw error;
    }
  }

  /**
   * Отправляет запрос на обратный звонок.
   * @param contactData Объект с данными контакта.
   * Возвращает Promise.
   */
  async requestCall(contactData: ContactData): Promise<ApiResponse> {
    const url = `${this.baseApiUrl}/request-call`;
    
    // 🛑 Используем .toPromise() для конвертации Observable в Promise
    try {
        const response = await this.http.post<ApiResponse>(url, contactData).toPromise();
        // В случае успеха возвращаем ответ бэкенда
        return response as ApiResponse;
    } catch (error) {
        // В случае HTTP-ошибки пробрасываем ее
        throw error;
    }
  }
}