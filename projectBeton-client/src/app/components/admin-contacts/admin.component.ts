import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { CommonModule } from "@angular/common";

interface PhoneData {
    phoneNumber: string,
    phoneHref: string;
    emails: string[];
    primaryEmail: string;
    primaryEmailHref: string;
    address: string;
    mapEmbedUrl: string;
    mapEditorUrl: string;
}

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.less'],
    standalone: true,
    imports: [FormsModule, CommonModule]
})
export class AdminContacts {
    http = inject(HttpClient);
    phoneNumber: string = 'Загрузка...';
    phoneHref: string = '#';
    address: string = '';
    mapEmbedUrl: string = '';
    mapEditorUrl: string = 'https://www.openstreetmap.org/?mlat=57.008438&mlon=40.881230#map=14/57.008438/40.881230';
    emails: string[] = [];
    newEmail: string = '';

    ngOnInit(): void {
        this.getPhoneNumber();
    }

    getPhoneNumber(): void {
        const apiUrl = '/api/get-phone-number';

        this.http.get<PhoneData>(apiUrl).subscribe({
            next: data => {
                this.phoneNumber = data.phoneNumber;
                this.phoneHref = data.phoneHref;
                this.address = data.address ?? '';
                this.mapEmbedUrl = data.mapEmbedUrl ?? '';
                this.mapEditorUrl = data.mapEditorUrl ?? this.mapEditorUrl;
                this.emails = data.emails ?? [];
            },
            error: err => {
                console.error('Ошибка загрузки номера телефона:', err);
                this.phoneNumber = 'Номер недоступен';
                this.phoneHref = '#';
                this.address = '';
                this.mapEmbedUrl = '';
                this.emails = [];
            }
        });
    }

    setPhoneNumber(): void {
        const apiUrl = '/api/set-phone-number';
        const body = {
            phoneNumber: this.phoneNumber,
            phoneHref: this.phoneHref,
            address: this.address,
            mapEmbedUrl: this.mapEmbedUrl
        };

        this.http.post(apiUrl, body).subscribe({
            next: () => {
                alert('Номер телефона успешно обновлен!');
                this.getPhoneNumber();
            },
            error: err => {
                console.error('Ошибка при обновлении номера телефона:', err);
                alert('Не удалось обновить номер телефона.');
            }
        });
    }

    addEmail(): void {
        const trimmedEmail = this.newEmail.trim().toLowerCase();
        if (!trimmedEmail) {
            return;
        }

        this.http.post('/api/add-contact-email', { email: trimmedEmail }).subscribe({
            next: () => {
                this.newEmail = '';
                this.getPhoneNumber();
            },
            error: err => {
                console.error('Ошибка при добавлении email:', err);
                alert('Не удалось добавить email.');
            }
        });
    }

    removeEmail(email: string): void {
        this.http.post('/api/delete-contact-email', { email }).subscribe({
            next: () => {
                this.getPhoneNumber();
            },
            error: err => {
                console.error('Ошибка при удалении email:', err);
                alert('Не удалось удалить email.');
            }
        });
    }
}