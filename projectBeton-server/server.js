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
const DeliveryCity = require('./models/DeliveryCity');
const DB_URL = 'mongodb://localhost:27017/projectBeton';
const User = require('./models/User.js');
const JWT_SECRET = '3bdd2e176361db6221c0bfe59befd91cbe1969ba89c0b42e616e5ef008e8258d5f39aee4cfb35dc007c77255730306c8ae0bdb049d6dd80246a06e986566b24a';
const Work = require('./models/Work');

const DEFAULT_DELIVERY_CITIES = [
    { slug: 'ivanovo', name: 'Иваново', cityPrepositional: 'Иваново', district: 'Ивановской области' },
    { slug: 'shuya', name: 'Шуя', cityPrepositional: 'Шуе', district: 'Шуйскому району' },
    { slug: 'vichuga', name: 'Вичуга', cityPrepositional: 'Вичуге', district: 'Вичугскому району' },
    { slug: 'furmanov', name: 'Фурманов', cityPrepositional: 'Фурманове', district: 'Фурмановскому району' },
    { slug: 'teykovo', name: 'Тейково', cityPrepositional: 'Тейкове', district: 'Тейковскому району' },
    { slug: 'kokhma', name: 'Кохма', cityPrepositional: 'Кохме', district: 'Ивановскому району' },
    { slug: 'rodniki', name: 'Родники', cityPrepositional: 'Родниках', district: 'Родниковскому району' },
    { slug: 'privolzhsk', name: 'Приволжск', cityPrepositional: 'Приволжске', district: 'Приволжскому району' },
    { slug: 'yuzha', name: 'Южа', cityPrepositional: 'Юже', district: 'Южскому району' },
    { slug: 'komsomolsk', name: 'Комсомольск', cityPrepositional: 'Комсомольске', district: 'Комсомольскому району' },
    { slug: 'gavrilov-posad', name: 'Гаврилов Посад', cityPrepositional: 'Гавриловом Посаде', district: 'Гаврилово-Посадскому району' },
    { slug: 'ples', name: 'Плёс', cityPrepositional: 'Плёсе', district: 'Приволжскому району' }
];

async function ensureDeliveryCitiesSeeded() {
    try {
        for (const city of DEFAULT_DELIVERY_CITIES) {
            await DeliveryCity.updateOne(
                { slug: city.slug },
                {
                    $setOnInsert: {
                        pricePerM3: 0,
                        isActive: true
                    },
                    $set: {
                        name: city.name,
                        cityPrepositional: city.cityPrepositional,
                        district: city.district
                    }
                },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error('Ошибка инициализации городов доставки:', error);
    }
}

function normalizeSlug(value = '') {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

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
    .then(async () => {
        console.log('MongoDB successfully connected locally');
        await ensureDeliveryCitiesSeeded();
    })
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

/**
 * Этот процесс — только API (:3000). Любой GET/HEAD не под /api иначе даёт Express "Cannot GET".
 * Сразу пересылаем на SSR/фронт (:4000). В проде: FRONTEND_URL=https://ваш-домен.ru
 */
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
    }
    if (req.path.startsWith('/api')) {
        return next();
    }
    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:4000').replace(/\/$/, '');
    const suffix = req.originalUrl || '/';
    return res.redirect(302, `${frontendBase}${suffix}`);
});

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
    Service.find().sort({ category: 1, name: 1 })
        .then(services => res.json(services))
        .catch(err => {
            console.error('Ошибка при получении услуг:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера при получении списка услуг.' });
        });
});

// 2. POST /api/services - Создать новую услугу
app.post('/api/services', authenticateToken, (req, res) => {
    // Деструктуризация для получения нового поля unit
    const { category, groupSubtitle, name, price, unit } = req.body;
    const normalizedCategory = String(category || '').trim();
    const normalizedGroupSubtitle = String(groupSubtitle || '').trim();

    // ВАЛИДАЦИЯ: Проверяем наличие unit, а также имя и цену.
    // Если price в схеме Mongoose изменен на Number, проверяем его тип.
    if (!normalizedCategory || !name || typeof price !== 'number' || price < 0 || !unit || typeof unit !== 'string') {
        return res.status(400).json({ error: 'Требуется группа, непустое название, цена (число не меньше 0) и единица измерения (строка) для создания услуги.' });
    }

    // Создаем новый объект, включая unit
    const newService = new Service({ category: normalizedCategory, groupSubtitle: normalizedGroupSubtitle, name, price, unit });

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
    const { category, groupSubtitle, name, price, unit } = req.body;
    const normalizedCategory = String(category || '').trim();
    const normalizedGroupSubtitle = String(groupSubtitle || '').trim();

    // ВАЛИДАЦИЯ: Проверяем наличие unit, а также имя и цену.
    if (!normalizedCategory || !name || typeof price !== 'number' || price < 0 || !unit || typeof unit !== 'string') {
        return res.status(400).json({ error: 'Требуется группа, непустое название, цена (число не меньше 0) и единица измерения (строка) для обновления услуги.' });
    }

    // Объект для обновления, включает name, price и unit
    const updateData = { category: normalizedCategory, groupSubtitle: normalizedGroupSubtitle, name, price, unit };

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

const DEFAULT_CONTACT_ADDRESS = '141009, г. Иваново, ул. Бетонная, 5';
const DEFAULT_MAP_EMBED_URL = 'https://www.openstreetmap.org/export/embed.html?bbox=40.831230%2C56.988438%2C40.931230%2C57.028438&layer=mapnik&marker=57.008438%2C40.881230';
const MAP_EDITOR_URL = 'https://www.openstreetmap.org/?mlat=57.008438&mlon=40.881230#map=14/57.008438/40.881230';

app.get('/api/get-phone-number', (req, res) => {
    Contact.findOne({ type: 'main' }).then(mainContact => {
        if (!mainContact) {
            return res.status(404).json({ error: 'Contacts not found in DB.' });
        }

        const normalizedPhone = (mainContact.phoneNumber || '').trim();
        const sanitizedPhoneHref = normalizedPhone ? `tel:${normalizedPhone.replace(/[^\d+]/g, '')}` : '#';
        const emails = Array.isArray(mainContact.emails) ? mainContact.emails : [];
        const primaryEmail = emails[0] || '';
        const address = (mainContact.address || '').trim() || DEFAULT_CONTACT_ADDRESS;
        const mapEmbedUrl = (mainContact.mapEmbedUrl || '').trim() || DEFAULT_MAP_EMBED_URL;

        res.json({
            phoneNumber: normalizedPhone || 'Номер недоступен',
            phoneHref: sanitizedPhoneHref,
            emails,
            primaryEmail,
            primaryEmailHref: primaryEmail ? `mailto:${primaryEmail}` : '#',
            address,
            mapEmbedUrl,
            mapEditorUrl: MAP_EDITOR_URL
        });
    }).catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error while fetching contacts.' });
    });
});

app.post('/api/set-phone-number', (req, res) => {
    const { phoneNumber, address, mapEmbedUrl } = req.body;
    const normalizedPhone = (phoneNumber || '').trim();
    const phoneHref = normalizedPhone ? `tel:${normalizedPhone.replace(/[^\d+]/g, '')}` : '#';
    const normalizedAddress = String(address || '').trim();
    const normalizedMapEmbedUrl = String(mapEmbedUrl || '').trim();

    Contact.findOneAndUpdate(
        { type: 'main' },
        {
            phoneNumber: normalizedPhone,
            phoneHref,
            address: normalizedAddress,
            mapEmbedUrl: normalizedMapEmbedUrl,
            $setOnInsert: { type: 'main' }
        },
        { new: true, upsert: true }
    )
        .then(updatedContact => {
            res.json({
                message: 'Phone number updated successfully.',
                phoneNumber: updatedContact.phoneNumber,
                phoneHref: updatedContact.phoneHref,
                address: updatedContact.address || '',
                mapEmbedUrl: updatedContact.mapEmbedUrl || ''
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error while updating phone number.' });
        });
});

app.post('/api/add-contact-email', (req, res) => {
    const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Укажите корректный email.' });
    }

    Contact.findOneAndUpdate(
        { type: 'main' },
        {
            $addToSet: { emails: normalizedEmail },
            $setOnInsert: {
                type: 'main',
                phoneNumber: '',
                phoneHref: '#',
                address: DEFAULT_CONTACT_ADDRESS,
                mapEmbedUrl: DEFAULT_MAP_EMBED_URL
            }
        },
        { new: true, upsert: true }
    )
        .then(updatedContact => {
            res.json({
                message: 'Email added successfully.',
                emails: updatedContact.emails || []
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error while adding email.' });
        });
});

app.post('/api/delete-contact-email', (req, res) => {
    const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();

    if (!normalizedEmail) {
        return res.status(400).json({ error: 'Email для удаления не указан.' });
    }

    Contact.findOneAndUpdate(
        { type: 'main' },
        { $pull: { emails: normalizedEmail } },
        { new: true }
    )
        .then(updatedContact => {
            if (!updatedContact) {
                return res.status(404).json({ error: 'Контакты не найдены.' });
            }

            res.json({
                message: 'Email deleted successfully.',
                emails: updatedContact.emails || []
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error while deleting email.' });
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
    const {
        name,
        phone,
        quantity,
        brand,
        concreteCost = 0,
        includeDelivery = false,
        deliveryCityName = '',
        deliveryCityPricePerM3 = 0,
        deliveryBillableVolume = 0,
        deliveryCost = 0,
        includePump = false,
        pumpServiceName = '',
        pumpHours = 0,
        pumpCost = 0,
        finalTotal = 0
    } = req.body;

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
            <p><b>Бетон:</b> ${concreteCost} руб.</p>
            ${includeDelivery ? `<p><b>Доставка:</b> ${deliveryCost} руб. (${deliveryCityName}, ${deliveryCityPricePerM3} руб/м³, расчетный объем ${deliveryBillableVolume} м³)</p>` : ''}
            ${includePump ? `<p><b>Бетононасос:</b> ${pumpCost} руб. (${pumpServiceName}, ${pumpHours} ч)</p>` : ''}
            <p><b>Итого:</b> ${finalTotal} руб.</p>
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

app.get('/api/delivery-cities', (req, res) => {
    DeliveryCity.find({ isActive: true })
        .sort({ name: 1 })
        .select('slug name cityPrepositional district pricePerM3 isActive')
        .then(cities => res.json(cities))
        .catch(err => {
            console.error('Ошибка при получении городов доставки:', err);
            res.status(500).json({ error: 'Ошибка загрузки городов доставки' });
        });
});

app.get('/api/admin/delivery-cities', authenticateToken, (req, res) => {
    DeliveryCity.find()
        .sort({ name: 1 })
        .select('slug name cityPrepositional district pricePerM3 isActive')
        .then(cities => res.json(cities))
        .catch(err => {
            console.error('Ошибка при получении городов доставки (админка):', err);
            res.status(500).json({ error: 'Ошибка загрузки городов доставки' });
        });
});

app.post('/api/admin/delivery-cities', authenticateToken, async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        const slugInput = String(req.body?.slug || '').trim();
        const cityPrepositional = String(req.body?.cityPrepositional || '').trim();
        const district = String(req.body?.district || '').trim();
        const pricePerM3 = Number(req.body?.pricePerM3 ?? 0);
        const slug = normalizeSlug(slugInput);

        if (!name || !slug || !cityPrepositional || !district) {
            return res.status(400).json({ error: 'Заполните название, slug, форму города и район.' });
        }
        if (!Number.isFinite(pricePerM3) || pricePerM3 < 0) {
            return res.status(400).json({ error: 'Цена за м3 должна быть числом не меньше 0.' });
        }

        const existing = await DeliveryCity.findOne({ slug });
        if (existing) {
            return res.status(409).json({ error: 'Город с таким slug уже существует.' });
        }

        const created = await DeliveryCity.create({
            slug,
            name,
            cityPrepositional,
            district,
            pricePerM3,
            isActive: true
        });

        res.status(201).json(created);
    } catch (err) {
        console.error('Ошибка при создании города доставки:', err);
        res.status(500).json({ error: 'Ошибка сохранения города доставки' });
    }
});

app.put('/api/admin/delivery-cities/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const name = String(req.body?.name || '').trim();
        const slugInput = String(req.body?.slug || '').trim();
        const cityPrepositional = String(req.body?.cityPrepositional || '').trim();
        const district = String(req.body?.district || '').trim();
        const pricePerM3 = Number(req.body?.pricePerM3 ?? 0);
        const isActive = Boolean(req.body?.isActive);
        const slug = normalizeSlug(slugInput);

        if (!name || !slug || !cityPrepositional || !district) {
            return res.status(400).json({ error: 'Заполните название, slug, форму города и район.' });
        }
        if (!Number.isFinite(pricePerM3) || pricePerM3 < 0) {
            return res.status(400).json({ error: 'Цена за м3 должна быть числом не меньше 0.' });
        }

        const duplicate = await DeliveryCity.findOne({ slug, _id: { $ne: id } });
        if (duplicate) {
            return res.status(409).json({ error: 'Город с таким slug уже существует.' });
        }

        const updated = await DeliveryCity.findByIdAndUpdate(
            id,
            { name, slug, cityPrepositional, district, pricePerM3, isActive },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Город не найден.' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Ошибка при обновлении города доставки:', err);
        res.status(500).json({ error: 'Ошибка обновления города доставки' });
    }
});

app.delete('/api/admin/delivery-cities/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await DeliveryCity.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Город не найден.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Ошибка при удалении города доставки:', err);
        res.status(500).json({ error: 'Ошибка удаления города доставки' });
    }
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

app.listen(PORT, () => {
    console.log(`API: http://localhost:${PORT} (только /api/*). Сайт: ${process.env.FRONTEND_URL || 'http://localhost:4000'}`);
});