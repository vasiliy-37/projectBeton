import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Описываем, как выглядит объект "Работа"
export interface WorkItem {
  _id?: string;
  title: string;
  /** URL вида /uploads/works/... (отдаёт API) */
  imageUrl: string;
}

@Injectable({
  providedIn: 'root' // Сервис будет доступен во всем приложении
})
export class WorkService {
  private http = inject(HttpClient);
  
  // Создаем сигнал, который будет хранить список работ
  // Компоненты будут "подписываться" на него автоматически
  private worksSignal = signal<WorkItem[]>([]);

  // Метод, чтобы компоненты могли просто читать данные
  public works = this.worksSignal.asReadonly();

  // 1. Получить все работы из базы
  loadAll() {
    this.http.get<WorkItem[]>('/api/works').subscribe(data => {
      this.worksSignal.set(data);
    });
  }

  // 2. Отправить новую работу: сервер сохранит файл; тело — title + imageData (data URL с админки)
  create(payload: { title: string; imageData: string }) {
    return this.http.post<WorkItem>('/api/works', payload).subscribe((newWork) => {
      // Обновляем сигнал: добавляем новую работу к текущим
      this.worksSignal.update(current => [...current, newWork]);
    });
  }

  // 3. Удалить работу
  delete(id: string) {
    this.http.delete(`/api/works/${id}`).subscribe(() => {
      // Убираем удаленную работу из списка в памяти
      this.worksSignal.update(current => current.filter(w => w._id !== id));
    });
  }
}