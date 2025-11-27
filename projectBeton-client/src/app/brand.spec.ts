import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Brand {
  _id: string;
  brand: string; 
  // price?: number; 
}

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private apiUrl = 'http://localhost:3000/api/brands';

  constructor(private http: HttpClient) { }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.apiUrl);
  }
}