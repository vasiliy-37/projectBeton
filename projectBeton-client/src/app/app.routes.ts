import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Price } from './components/price/price';
import { Services } from './components/services/services';
import { Contacts } from './components/contacts/contacts';
import { AdminContacts } from './components/admin-contacts/admin.component';
import { AdminPrice } from './components/admin-price/admin-price';
import { AdminService } from './components/admin-service/admin-service';
import { AdminLayout } from './components/admin-layout/admin-layout';

export const routes: Routes = [
    { path: '', component: Home, title: 'Главная' },
    { path: 'price', component: Price, title: 'Прайс-лист' },
    { path: 'services', component: Services, title: 'Услуги' },
    { path: 'contacts', component: Contacts, title: 'Контакты' },

    { 
        path: 'admin',                  
        component: AdminLayout, 
        children: [                     
            { path: 'price', component: AdminPrice, title: 'Админка-Прайса'}, 
            { path: 'service', component: AdminService, title: 'Админка-Услуги'}, 
            { path: 'contacts', component: AdminContacts, title: 'Админка' },
            { path: '', redirectTo: 'contacts', pathMatch: 'full' }
        ]
    },
    
    { path: '**', redirectTo: '' }
];
