import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Price } from './components/price/price';
import { Services } from './components/services/services';
import { Contacts } from './components/contacts/contacts';
import { AdminContacts } from './components/admin-contacts/admin.component';
import { AdminPrice } from './components/admin-price/admin-price';
import { AdminService } from './components/admin-service/admin-service';
import { AdminLayout } from './components/admin-layout/admin-layout';
import { LoginComponent } from './components/login/login';
import { AuthGuard } from './auth-guard';
import { AdminChatsComponent } from './components/admin-chats/admin-chats';
import { AdminWorks } from './components/admin-works/admin-works';
import { Useful } from './components/useful/useful';

export const routes: Routes = [
    { path: '', component: Home, title: 'Главная' },
    { path: 'price', component: Price, title: 'Прайс-лист' },
    { path: 'services', component: Services, title: 'Услуги' },
    { path: 'useful', component: Useful, title: 'Как выбрать марку бетона: таблица и советы' },
    { path: 'contacts', component: Contacts, title: 'Контакты' },

    { path: 'login', component: LoginComponent, title: 'Вход Администратора' },

    { 
        path: 'admin',                  
        component: AdminLayout, 
        canActivate: [AuthGuard],
        children: [                     
            { path: 'price', component: AdminPrice, title: 'Админка-Прайса'}, 
            { path: 'service', component: AdminService, title: 'Админка-Услуги'}, 
            { path: 'contacts', component: AdminContacts, title: 'Админка' },
            { path: 'chats', component: AdminChatsComponent, title: 'Чаты' },
            { path: 'fotoedit', component: AdminWorks, title: 'Редактор Фото' },
            { path: '', redirectTo: 'contacts', pathMatch: 'full' }
        ]
    },
    
    { path: '**', redirectTo: '' }
];
