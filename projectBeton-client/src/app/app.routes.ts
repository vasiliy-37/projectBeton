import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Price } from './components/price/price';
import { Services } from './components/services/services';
import { Contacts } from './components/contacts/contacts';
import { AdminComponent } from './components/admin/admin.component';
import { AdminPrice } from './components/admin-price/admin-price';
import { AdminService } from './components/admin-service/admin-service';

export const routes: Routes = [
    { path: '', component: Home, title: 'Главная' },

    { path: 'price', component: Price, title: 'Прайс-лист' },

    { path: 'admin/price', component: AdminPrice, title: 'Админка-Прайса'},

    { path: 'services', component: Services, title: 'Услуги' },

    {path: 'admin/service', component: AdminService, title: 'Админка-Услуги'},

    { path: 'contacts', component: Contacts, title: 'Контакты' },

    { path: 'admin', component: AdminComponent, title: 'Админка' },

    { path: '**', redirectTo: '' }
];
