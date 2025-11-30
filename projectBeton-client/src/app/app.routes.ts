import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Price } from './components/price/price';
import { Services } from './components/services/services';
import { Contacts } from './components/contacts/contacts';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
    { path: '', component: Home, title: 'Главная' },

    { path: 'price', component: Price, title: 'Прайс-лист' },

    { path: 'services', component: Services, title: 'Услуги' },

    { path: 'contacts', component: Contacts, title: 'Контакты' },

    { path: 'admin', component: AdminComponent, title: 'Админка' },

    { path: '**', redirectTo: '' }
];
