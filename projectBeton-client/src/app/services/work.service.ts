import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

  /**
   * Путь должен начинаться с /. Иначе на странице /admin/... браузер запросит /admin/uploads/... → 404.
   */
  normalizeWorkImageUrl(url: string | undefined | null): string {
    if (url == null || url === '') {
      return '';
    }
    const u = String(url).trim();
    if (/^https?:\/\//i.test(u)) {
      return u;
    }
    return u.startsWith('/') ? u : `/${u}`;
  }

  private mapWorkItem(w: WorkItem): WorkItem {
    return { ...w, imageUrl: this.normalizeWorkImageUrl(w.imageUrl) };
  }

  // 1. Получить все работы из базы
  loadAll() {
    this.http.get<WorkItem[]>('/api/works').subscribe((data) => {
      this.worksSignal.set(data.map((w) => this.mapWorkItem(w)));
    });
  }

  // 2. Отправить новую работу: сервер сохранит файл; тело — title + imageData (data URL с админки)
  create(payload: { title: string; imageData: string }): Observable<WorkItem> {
    return this.http.post<WorkItem>('/api/works', payload).pipe(
      tap((newWork) => {
        this.worksSignal.update((current) => [...current, this.mapWorkItem(newWork)]);
      }),
    );
  }

  // 3. Удалить работу
  delete(id: string) {
    this.http.delete(`/api/works/${id}`).subscribe(() => {
      // Убираем удаленную работу из списка в памяти
      this.worksSignal.update(current => current.filter(w => w._id !== id));
    });
  }
}