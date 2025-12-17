import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const ALLOWED_UNITS = ['руб.', 'руб/м³', 'руб/км', 'руб/час'] as const;
type ServiceUnit = typeof ALLOWED_UNITS[number];

export interface ServiceItem {
  _id: string;
  name: string;
  price: number;
  unit:ServiceUnit;
}

@Component({
  selector: 'app-service-list',
  imports: [CommonModule],
  templateUrl: './service-list.html',
  styleUrl: './service-list.less'
})
export class ServiceList implements OnInit{
 services: ServiceItem[] = [];
  isLoading = true;
  error: string | null = null;
  private apiUrl = '/api/services'; // Используем прокси

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchServices();
  }

  fetchServices(): void {
    this.http.get<ServiceItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить услуги.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}