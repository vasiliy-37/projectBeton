# 🚀 ProjectBeton - Полнофункциональный веб-приложение для бетонного завода

[![Angular](https://img.shields.io/badge/Angular-20.3.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.19.2-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 📋 Описание проекта

**ProjectBeton** - это современное полнофункциональное веб-приложение для управления бетонным заводом, разработанное с использованием стека MEAN (MongoDB, Express.js, Angular, Node.js). Приложение предоставляет комплексное решение для управления заказами, ценами, услугами и коммуникацией с клиентами.

### 🎯 Основные возможности

- **👤 Админ-панель**: Полный контроль над контентом, ценами и заказами
- **💬 Чат-система**: Реал-тайм общение между администраторами и клиентами
- **🧮 Калькулятор цен**: Автоматический расчет стоимости бетонных смесей
- **📝 Управление заказами**: Полный цикл обработки заявок от создания до завершения
- **📞 Управление контактами**: Система обработки заявок и обратной связи
- **📱 Адаптивный дизайн**: Оптимизирован для всех устройств
- **🔐 Аутентификация**: Безопасная система входа для администраторов
- **📊 Управление контентом**: Интуитивный интерфейс для редактирования информации
- **📊 Конвертация изображений**: Для производительности и экономии места на сервере


## 🏗️ Архитектура проекта

```
projectBeton/
├── projectBeton-client/     # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # UI компоненты
│   │   │   ├── services/    # Сервисы для API
│   │   │   └── guards/      # Защита маршрутов
│   └── public/assets/       # Статические ресурсы
├── projectBeton-server/     # Node.js backend
│   ├── models/              # Mongoose модели
│   ├── controllers/         # Контроллеры API
│   ├── auth.js              # Аутентификация
│   └── server.js            # Главный сервер
└── database/                # Скрипты базы данных
    └── createDb.js          # Инициализация MongoDB
```

## 🛠️ Технологии

### Frontend
- **Angular 20.3.0** - Фреймворк для разработки
- **TypeScript 5.9.2** - Типизированный JavaScript
- **Less** - Препроцессор CSS
- **Socket.IO Client** - Реал-тайм коммуникация

### Backend
- **Node.js** - Серверная платформа
- **Express.js 5.1.0** - Веб-фреймворк
- **MongoDB + Mongoose 8.19.2** - База данных
- **Socket.IO** - WebSocket сервер
- **JWT** - Аутентификация
- **bcrypt** - Хеширование паролей

### Дополнительно
- **MongoDB Shell** - Управление базой данных
- **Nodemailer** - Отправка email
- **CORS** - Кросс-доменные запросы

## 🚀 Установка и запуск

### Предварительные требования

- **Node.js** (версия 18+)
- **MongoDB** (локально или Atlas)
- **Angular CLI** (глобально)

```bash
npm install -g @angular/cli
```

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd projectBeton-main
```

### 2. Настройка базы данных

Запустите MongoDB и выполните скрипт инициализации:

```bash
mongosh --file database/createDb.js
```

### 3. Установка зависимостей

#### Backend (Сервер)
```bash
cd projectBeton-server
npm install
```

#### Frontend (Клиент)
```bash
cd ../projectBeton-client
npm install
```

### 4. Настройка переменных окружения

Создайте файл `.env` в папке `projectBeton-server/`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/projectbeton
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

### 5. Запуск приложения

#### В одном терминале - Backend
```bash
cd projectBeton-server
npm start
```

#### В другом терминале - Frontend
```bash
cd projectBeton-client
ng serve
```

Приложение будет доступно по адресу: `http://localhost:4200`

## 📚 API Документация

### Основные эндпоинты

#### Аутентификация
- `POST /api/auth/login` - Вход администратора
- `POST /api/auth/register` - Регистрация администратора

#### Управление контентом
- `GET /api/services` - Получить все услуги
- `POST /api/services` - Создать новую услугу
- `PUT /api/services/:id` - Обновить услугу
- `DELETE /api/services/:id` - Удалить услугу

#### Заказы
- `GET /api/orders` - Получить все заказы
- `POST /api/orders` - Создать заказ
- `PUT /api/orders/:id/status` - Обновить статус заказа

#### Чат
- `GET /api/chat/sessions` - Получить сессии чата
- `POST /api/chat/message` - Отправить сообщение

## 🎨 Особенности реализации

### 🔐 Система аутентификации
- JWT токены для безопасной аутентификации
- Защищенные маршруты с помощью Auth Guards
- Хеширование паролей с bcrypt

### 💬 Реал-тайм чат
- WebSocket соединения через Socket.IO
- Сохранение истории сообщений в MongoDB
- Уведомления в реальном времени

### 📱 Адаптивный интерфейс
- Mobile-first подход
- Flexbox и Grid layouts
- Кастомные компоненты Angular

### 🧮 Калькулятор цен
- Динамический расчет стоимости
- Интеграция с базой данных брендов песка
- Автоматическое обновление цен

## 🧪 Тестирование

### Frontend тесты
```bash
cd projectBeton-client
ng test
```

### Backend тесты
```bash
cd projectBeton-server
npm test
```

## 📦 Сборка для продакшена

### Frontend
```bash
cd projectBeton-client
ng build --configuration production
```

### Backend
```bash
cd projectBeton-server
npm run build  # если есть скрипт сборки
```

## 🤝 Вклад в проект

1. Fork проект
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👨‍💻 Автор

**Владимир Трунов** - Full-Stack Developer

- LinkedIn: [Ваш LinkedIn профиль]
- Email: vladimir@example.com
- GitHub: [Ваш GitHub профиль]

---

⭐ Если проект вам понравился, поставьте звезду!