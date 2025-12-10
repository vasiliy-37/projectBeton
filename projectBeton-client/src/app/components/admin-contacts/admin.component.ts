import { Component, signal, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from '@angular/common/http';

interface PhoneData {
    phoneNumber: string,
    phoneHref: string;
}

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.less'],
    standalone: true,
    imports: [FormsModule]
})
export class AdminContacts {
    http = inject(HttpClient);
    phoneNumber: string = 'Загрузка...';
    phoneHref: string = '#';

    ngOnInit(): void {
        this.getPhoneNumber();
    }

    getPhoneNumber(): void {
        const apiUrl = '/api/get-phone-number';

        this.http.get<PhoneData>(apiUrl).subscribe({
            next: data => {
                this.phoneNumber = data.phoneNumber;
                this.phoneHref = data.phoneHref;
            },
            error: err => {
                console.error('Ошибка загрузки номера телефона:', err);
                this.phoneNumber = 'Номер недоступен';
                this.phoneHref = '#';
            }
        });
    }

    setPhoneNumber(): void {
        const apiUrl = '/api/set-phone-number';
        const body = {
            phoneNumber: this.phoneNumber,
            phoneHref: this.phoneHref
        };

        this.http.post(apiUrl, body).subscribe({
            next: () => {
                alert('Номер телефона успешно обновлен!');
            },
            error: err => {
                console.error('Ошибка при обновлении номера телефона:', err);
                alert('Не удалось обновить номер телефона.');
            }
        });
    }
}