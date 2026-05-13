import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { AuthGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Купить бетон в Иваново и области — доставка с завода | ProjectBeton'
  },

  {
    path: 'price',
    loadComponent: () => import('./components/price/price').then((m) => m.Price),
    title: 'Цены на бетон в Иваново - стоимость за 1 м3 | ProjectBeton'
  },
  {
    path: 'services',
    loadComponent: () => import('./components/services/services').then((m) => m.Services),
    title: 'Доставка бетона и услуги бетононасоса в Иваново | ProjectBeton'
  },
  {
    path: 'useful',
    loadComponent: () => import('./components/useful/useful').then((m) => m.Useful),
    title: 'Полезное: марки бетона, уход после заливки, приёмка | ProjectBeton'
  },
  {
    path: 'beton-v/:city',
    loadComponent: () => import('./components/city-landing/city-landing').then((m) => m.CityLanding),
    title: 'Бетон с доставкой по Ивановской области'
  },
  {
    path: 'contacts',
    loadComponent: () => import('./components/contacts/contacts').then((m) => m.Contacts),
    title: 'Контакты ProjectBeton в Иваново | Телефон, адрес, email'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./components/privacy/privacy').then((m) => m.Privacy),
    title: 'Политика конфиденциальности и персональные данные | Бетон-Строй'
  },

  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.LoginComponent),
    title: 'Вход Администратора'
  },

  {
    path: 'admin',
    loadComponent: () => import('./components/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'price',
        loadComponent: () => import('./components/admin-price/admin-price').then((m) => m.AdminPrice),
        title: 'Админка-Прайса'
      },
      {
        path: 'service',
        loadComponent: () => import('./components/admin-service/admin-service').then((m) => m.AdminService),
        title: 'Админка-Услуги'
      },
      {
        path: 'contacts',
        loadComponent: () => import('./components/admin-contacts/admin.component').then((m) => m.AdminContacts),
        title: 'Админка'
      },
      {
        path: 'delivery-cities',
        loadComponent: () =>
          import('./components/admin-delivery-cities/admin-delivery-cities').then((m) => m.AdminDeliveryCities),
        title: 'Админка - Города доставки'
      },
      {
        path: 'fotoedit',
        loadComponent: () => import('./components/admin-works/admin-works').then((m) => m.AdminWorks),
        title: 'Редактор Фото'
      },
      { path: '', redirectTo: 'contacts', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
