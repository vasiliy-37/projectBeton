require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const http = require('http');
const { Server } = require('socket.io');
const chatController = require('./controllers/chatController.js')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const nodemailer = require('nodemailer')

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const Product = require('./models/product');
const sandBrands = require('./models/sandBrands');
const Service = require('./models/Service');
const Contact = require('./models/contacts.js');
const DB_URL = 'mongodb://localhost:27017/projectBeton';
const User = require('./models/User.js');
const JWT_SECRET = '3bdd2e176361db6221c0bfe59befd91cbe1969ba89c0b42e616e5ef008e8258d5f39aee4cfb35dc007c77255730306c8ae0bdb049d6dd80246a06e986566b24a';
const ChatSession = require('./models/ChatSession.js');
const Work = require('./models/Work');

const io = new Server(server, {
    cors: {
        // localhost и доступ по IP (ng serve --configuration lan, телефон в той же сети)
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

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
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(express.json({ limit: '10mb' }));
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

// --- ЛОГИКА СОКЕТОВ ---
io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    // 1. Вход в комнату (для гостя или админа, чтобы получать сообщения)
    socket.on('join_chat', async (guestId) => {
        socket.join(guestId);
        const existingChat = await chatController.getChatByGuestId(guestId);
        if (existingChat) {
            socket.emit('chat_history', existingChat.messages);
        }
    });

    // 2. ЗАПРОС СПИСКА ЧАТОВ (Для админки)
    // Теперь это работает независимо и четко
    socket.on('admin_get_all_chats', async () => {
        const chats = await chatController.getAllActiveChats();
        socket.emit('admin_chat_list', chats);
    });

    // 3. Админ заходит в конкретный чат
    socket.on('admin_join_guest_chat', async (guestId) => {
        socket.join(guestId); // Подписываемся на сообщения этого гостя
        const existingChat = await chatController.getChatByGuestId(guestId);
        if (existingChat) {
            socket.emit('chat_history', existingChat.messages);
        }
    });

    // 4. Получение и рассылка сообщений
    socket.on('send_message', async (data) => {
        const { guestId, text, sender } = data;

        const newMessage = {
            text: text,
            sender: sender || 'user',
            timestamp: new Date(),
            read: sender === 'admin' ? true : false
        };

        try {
            await chatController.saveMessage(guestId, newMessage);

            // Рассылаем сообщение всем в комнате guestId
            io.to(guestId).emit('receive_message', newMessage);

            // Если написал юзер — обновляем список чатов у админа (чтобы счетчик тикнул)
            if (sender !== 'admin') {
                const allChats = await chatController.getAllActiveChats();
                io.emit('admin_chat_list', allChats);
            }
        } catch (err) {
            console.error("Ошибка сохранения сообщения:", err);
        }
    });

    // 5. Пометка как прочитано
    socket.on('admin_mark_as_read', async (guestId) => {
        try {
            await ChatSession.updateOne(
                { guestId: guestId },
                { $set: { "messages.$[msg].read": true } },
                {
                    arrayFilters: [{ "msg.sender": "user", "msg.read": { $ne: true } }],
                    multi: true
                }
            );

            // СРАЗУ после обновления базы рассылаем свежий список чатов
            // Это уберет "воскресающие" цифры
            const allChats = await chatController.getAllActiveChats();
            io.emit('admin_chat_list', allChats);

        } catch (err) {
            console.error("Ошибка при обновлении статуса прочитано:", err);
        }
    });
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
app.post('/api/services', authenticateToken, (req, res) => {
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
app.put('/api/services/:id', authenticateToken, (req, res) => {
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
app.delete('/api/services/:id', authenticateToken, (req, res) => {
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
    Brand.find().sort({ category: 1, brand: 1 })
        .then(brands => res.json(brands))
        .catch(err => res.status(500).json({ error: 'Ошибка загрузки' }));
});

// 2. Создать новую марку в ЛЮБОЙ категории
app.post('/api/brands', authenticateToken, (req, res) => {
    const { brand, price, category } = req.body;

    if (!brand || !category) {
        return res.status(400).json({ error: 'Имя и категория обязательны' });
    }

    const newBrand = new Brand({ brand, price, category });
    newBrand.save()
        .then(doc => res.status(201).json(doc))
        .catch(err => res.status(500).json({ error: 'Ошибка сохранения' }));
});

// 3. Удалить марку
app.delete('/api/brands/:id', authenticateToken, (req, res) => {
    Brand.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send())
        .catch(err => res.status(500).json({ error: 'Ошибка удаления' }));
});

// app.get('/api/sandbrands', (req, res) => {
//     sandBrands.find().sort({ brand: 1 })
//         .then(brands => res.json(brands))
//         .catch(err => res.status(404).json({ nobrandsfound: 'Пескобетона не найдено' }));
// });

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

app.post('/api/update-price', authenticateToken, (req, res) => {
    const { _id, price } = req.body; // Поле type нам больше не нужно для выбора модели

    // Мы используем модель Brand (которая ссылается на ./models/product)
    Brand.findByIdAndUpdate(
        _id,
        { price: price },
        { new: true }
    )
        .then(updatedDoc => {
            if (!updatedDoc) {
                return res.status(404).json({ error: 'Документ не найден.' });
            }
            res.json({
                message: `Цена для ${updatedDoc.brand} успешно обновлена.`,
                newPrice: updatedDoc.price
            });
        })
        .catch(err => {
            console.error('Ошибка при обновлении цены:', err);
            res.status(500).json({ error: 'Ошибка сервера при обновлении цены.' });
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

app.get('/api/works', (req, res) => {
    Work.find().sort({ createdAt: -1 }) // Сначала новые
        .then(works => res.json(works))
        .catch(err => res.status(500).json({ error: 'Ошибка загрузки галереи' }));
});

// 2. Добавить новую работу (защищено токеном)
app.post('/api/works', authenticateToken, (req, res) => {
    const { title, imageData } = req.body;

    if (!title || !imageData) {
        return res.status(400).json({ error: 'Название и изображение обязательны' });
    }

    const newWork = new Work({ title, imageData });
    newWork.save()
        .then(doc => res.status(201).json(doc))
        .catch(err => res.status(500).json({ error: 'Ошибка сохранения в базу' }));
});

// 3. Удалить работу (защищено токеном)
app.delete('/api/works/:id', authenticateToken, (req, res) => {
    Work.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send())
        .catch(err => res.status(500).json({ error: 'Ошибка удаления' }));
});


server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});