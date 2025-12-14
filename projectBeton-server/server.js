require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const nodemailer = require('nodemailer')

const app = express();

const PORT = process.env.PORT || 3000;

const Product = require('./models/product');
const sandBrands = require('./models/sandBrands');
const Service = require('./models/Service');
const Contact = require('./models/contacts.js');
const DB_URL = 'mongodb://localhost:27017/projectBeton';
const User = require('./models/User.js')
const JWT_SECRET = '3bdd2e176361db6221c0bfe59befd91cbe1969ba89c0b42e616e5ef008e8258d5f39aee4cfb35dc007c77255730306c8ae0bdb049d6dd80246a06e986566b24a'

const authenticateToken = (req, res, next) => {
    const token = req.cookies.admin_auth_token; // <-- ЧИТАЕМ ИЗ КУКИ
    
    if (!token) {
        return res.status(401).json({ message: 'Требуется авторизация.' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Токен недействителен.' });
        }
        req.user = user; 
        next(); 
    });
};

mongoose.connect(DB_URL)
    .then(() => console.log('MongoDB successfully connected locally'))
    .catch(err => console.error('MongoDB connection error:', err));

const Brand = require('./models/product');

const corsOptions = {
    origin: 'http://localhost:4200', // Адрес вашего Angular-приложения
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true // <-- КЛЮЧЕВОЕ ЗНАЧЕНИЕ ДЛЯ КУК!
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Используйте ваш SMTP-сервер
    port: 465,
    secure: true, 
    auth: {
        // Логин и пароль берем из вашего .env файла
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("Ошибка при проверке транспорта Nodemailer:", error);
    } else {
        console.log("Nodemailer готов к отправке сообщений.");
    }
});

// 1. GET /api/services - Получить все услуги (существующий маршрут)
// Дублирующий маршрут в конце файла удален.
app.get('/api/services', (req, res) => {
    Service.find().sort({ name: 1 })
        .then(services => res.json(services))
        .catch(err => {
            console.error('Ошибка при получении услуг:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера при получении списка услуг.' });
        });
});

// 2. POST /api/services - Создать новую услугу
app.post('/api/services', (req, res) => {
    // Деструктуризация для получения нового поля unit
    const { name, price, unit } = req.body;

    // ВАЛИДАЦИЯ: Проверяем наличие unit, а также имя и цену.
    // Если price в схеме Mongoose изменен на Number, проверяем его тип.
    if (!name || typeof price !== 'number' || price <= 0 || !unit || typeof unit !== 'string') {
        return res.status(400).json({ error: 'Требуется непустое название, положительная цена (число) и единица измерения (строка) для создания услуги.' });
    }

    // Создаем новый объект, включая unit
    const newService = new Service({ name, price, unit });

    newService.save()
        .then(service => res.status(201).json(service))
        .catch(err => {
            console.error('Ошибка при создании услуги:', err);
            // Если Mongoose выдает ошибку валидации (например, required: true), она будет здесь.
            res.status(500).json({ error: 'Внутренняя ошибка сервера при создании услуги.', details: err.message });
        });
});

// 3. PUT /api/services/:id - Обновить существующую услугу
app.put('/api/services/:id', (req, res) => {
    const id = req.params.id;
    // Деструктуризация для получения нового поля unit
    const { name, price, unit } = req.body;

    // ВАЛИДАЦИЯ: Проверяем наличие unit, а также имя и цену.
    if (!name || typeof price !== 'number' || price <= 0 || !unit || typeof unit !== 'string') {
        return res.status(400).json({ error: 'Требуется непустое название, положительная цена (число) и единица измерения (строка) для обновления услуги.' });
    }

    // Объект для обновления, включает name, price и unit
    const updateData = { name, price, unit };

    Service.findByIdAndUpdate(
        id,
        updateData, // Используем обновленные данные
        { new: true, runValidators: true } // new: true возвращает обновленный документ; runValidators: true проверяет схему
    )
        .then(updatedService => {
            if (!updatedService) {
                return res.status(404).json({ error: `Услуга с ID ${id} не найдена.` });
            }
            res.json(updatedService);
        })
        .catch(err => {
            console.error('Ошибка при обновлении услуги:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера при обновлении услуги.', details: err.message });
        });
});

// 4. DELETE /api/services/:id - Удалить услугу
app.delete('/api/services/:id', (req, res) => {
    const id = req.params.id;

    Service.findByIdAndDelete(id)
        .then(deletedService => {
            if (!deletedService) {
                return res.status(404).json({ error: `Услуга с ID ${id} не найдена.` });
            }
            // 204 No Content - успешное удаление
            res.status(204).send();
        })
        .catch(err => {
            console.error('Ошибка при удалении услуги:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера при удалении услуги.' });
        });
});

app.get('/api/brands', (req, res) => {
    Brand.find() // Mongoose найдет все документы в коллекции 'brands'
        .sort({ name: 1 })
        .then(brands => res.json(brands)) // И вернет их в формате JSON
        .catch(err => res.status(404).json({ nobrandsfound: 'Марок не найдено' }));
});

app.get('/api/sandbrands', (req, res) => {
    sandBrands.find().sort({ brand: 1 })
        .then(brands => res.json(brands))
        .catch(err => res.status(404).json({ nobrandsfound: 'Пескобетона не найдено' }));
});

// Удален дублирующий GET /api/services

app.get('/api/get-phone-number', (req, res) => {
    // Вместо await Contact.findOne({}), используем Contact.findOne({}) без await
    Contact.findOne({}).then(mainContact => {
        if (mainContact && mainContact.phoneNumber) {
            res.json({
                phoneNumber: mainContact.phoneNumber, // Используем phoneNumber из БД
                phoneHref: `tel:${mainContact.phoneNumber.replace(/\s/g, '')}`
            });
        } else {
            res.status(404).json({ error: 'Phone number not found in DB.' });
        }
    }).catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error while fetching phone number.' });
    });
});

app.post('/api/set-phone-number', (req, res) => {
    const { phoneNumber } = req.body;

    // Update the phone number in the database
    Contact.findOneAndUpdate({}, { phoneNumber }, { new: true, upsert: true })
        .then(updatedContact => {
            res.json({
                message: 'Phone number updated successfully.',
                phoneNumber: updatedContact.phoneNumber
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error while updating phone number.' });
        });
});

app.post('/api/update-price', (req, res) => {
    const { _id, type, price } = req.body;
    let Model;

    if (type === 'Бетон') {
        Model = Product;
    } else if (type === 'Пескобетон') {
        Model = sandBrands;
    } else {
        return res.status(400).json({ error: 'Неизвестный тип продукта. Обновление невозможно.' });
    }

    Model.findByIdAndUpdate(
        _id,
        { price: price },
        { new: true }
    )
        .then(updatedDoc => {
            if (!updatedDoc) {
                return res.status(404).json({ error: 'Документ для обновления не найден.' });
            }
            res.json({
                message: `Цена для ${updatedDoc.brand || updatedDoc.name} успешно обновлена.`,
                newPrice: updatedDoc.price
            });
        })
        .catch(err => {
            console.error('Ошибка при обновлении цены:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера при обновлении цены.' });
        });
});

app.get('/api/status', authenticateToken, (req, res) => {
    // Если мы сюда дошли, значит, authenticateToken сработал, и токен в куке действителен.
    res.status(200).json({ isAuthenticated: true });
});

app.post('/api/login', async (req, res) => {
    // 1. Получаем данные
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Требуется логин и пароль.' });
    }

    try {
        // 2. Находим пользователя по логину через Mongoose
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(401).json({ message: 'Неверный логин или пароль.' });
        }

        // 3. Сравниваем введенный пароль с хэшем в БД
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный логин или пароль.' });
        }

        // 4. Создаем JWT-токен
        const payload = {
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' } // Токен действует 1 час
        );

        // 5. Устанавливаем токен в HTTP-Only куку вместо отправки в теле ответа
        // (Для production нужно установить secure: true)
        res.cookie('admin_auth_token', token, {
            httpOnly: true, // <-- Защита от XSS
            secure: false, // <-- Установите 'true' при развертывании на HTTPS!
            maxAge: 3600000, // 1 час в миллисекундах
            sameSite: 'Lax' // Рекомендованная настройка
        });

        // Отправляем ответ без токена в теле
        res.json({ message: 'Вход успешен!' });

    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера.' });
    }
});

app.post('/api/logout', (req, res) => {
    // Удаляем куку, передавая те же настройки, с которыми она была установлена
    res.clearCookie('admin_auth_token', {
        httpOnly: true,
        secure: false, // <-- Установите 'true' при развертывании на HTTPS!
        sameSite: 'Lax'
    });
    res.json({ message: 'Выход выполнен. Кука удалена.' });
});

app.post('/api/send-order', async (req, res) => {
    // Деструктуризация данных, пришедших из Angular (имя, телефон, количество, марка)
    const { name, phone, quantity, brand } = req.body;

    // Базовая валидация
    if (!name || !phone || !quantity || !brand) {
        return res.status(400).send({ message: 'Не все обязательные поля заполнены.' });
    }

    const mailOptions = {
        from: `"Бетон-Заказ" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL, // Ваш адрес, куда должны приходить заказы (из .env)
        subject: `НОВЫЙ ЗАКАЗ: ${brand} - ${quantity} м³`,
        html: `
            <h2>Детали заказа бетона</h2>
            <p><b>Имя клиента:</b> ${name}</p>
            <p><b>Номер телефона:</b> ${phone}</p>
            <hr>
            <p><b>Марка бетона:</b> ${brand}</p>
            <p><b>Количество:</b> ${quantity} м³</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Заказ от ${name} (${phone}) успешно отправлен.`);
        // Ответ Angular
        res.status(200).send({ success: true, message: 'Заказ успешно отправлен.' });
    } catch (error) {
        console.error('Ошибка отправки почты:', error);
        // Ответ Angular с ошибкой
        res.status(500).send({ success: false, message: 'Ошибка сервера при отправке почты.' });
    }
});

// НОВЫЙ МАРШРУТ: POST /api/request-call
// Для обработки заявки на обратный звонок
// ----------------------------------------
app.post('/api/request-call', async (req, res) => {
    // Получаем только имя и телефон, отправленные с Angular
    const { name, phone } = req.body;

    // Базовая валидация
    if (!name || !phone) {
        return res.status(400).send({ message: 'Необходимо указать имя и телефон.' });
    }

    const mailOptions = {
        from: `"Заявка на звонок" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL, // Ваш адрес, куда приходят заявки (из .env)
        subject: `ЗАПРОС НА ОБРАТНЫЙ ЗВОНОК от ${name}`,
        html: `
            <h2>Завка на сотрудничество!</h2>
            <p><b>Имя клиента:</b> ${name}</p>
            <p><b>Контактный телефон:</b> ${phone}</p>
            <hr>
            <p>Необходимо связаться с клиентом как можно скорее.</p>
        `
    };

    try {
        // Здесь используется 'transporter', который вы настроили ранее для Nodemailer
        await transporter.sendMail(mailOptions);
        console.log(`[CALL REQUEST] Запрос на звонок от ${name} (${phone}) успешно отправлен.`);
        // Успешный ответ для Angular
        res.status(200).send({ success: true, message: 'Заявка на звонок отправлена.' });
    } catch (error) {
        console.error('❌ Ошибка отправки почты (Заявка на звонок):', error);
        // Ответ с ошибкой для Angular
        res.status(500).send({ success: false, message: 'Ошибка сервера при отправке заявки.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});