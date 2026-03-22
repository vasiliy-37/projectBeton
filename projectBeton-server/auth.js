// auth.js (в корне сервера)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Для сравнения паролей
const jwt = require('jsonwebtoken'); // Для создания токена

// *** ВАЖНО ***: Замените это на вашу функцию, которая предоставляет доступ к MongoDB
// Если вы используете Mongoose, здесь будет импорт вашей модели User
const { getDb } = require('./db/connection'); 

// !!! ВАЖНО: ЗАМЕНИТЕ ЭТО НА СВОЙ СЕКРЕТНЫЙ КЛЮЧ !!!
const JWT_SECRET = 'мой_очень_секретный_ключ_для_подписи_токенов'; 

/**
 * POST /api/login
 * Маршрут для аутентификации администратора
 */
router.post('/login', async (req, res) => {
    // Получаем логин и пароль, отправленные Angular-формой
    const { username, password } = req.body; 

    if (!username || !password) {
        return res.status(400).json({ message: 'Требуется логин и пароль.' });
    }

    try {
        // 1. ПОИСК ПОЛЬЗОВАТЕЛЯ
        // *** ВАЖНО: Если вы используете Mongoose, код будет выглядеть иначе (e.g., User.findOne) ***
        const db = getDb(); 
        const user = await db.collection('users').findOne({ username: username });

        if (!user) {
            // Если пользователь не найден
            return res.status(401).json({ message: 'Неверный логин или пароль.' });
        }

        // 2. СРАВНЕНИЕ ПАРОЛЕЙ
        // Сравниваем введенный пароль с хэшем, хранящимся в базе данных
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Если пароли не совпали
            return res.status(401).json({ message: 'Неверный логин или пароль.' });
        }

        // 3. СОЗДАНИЕ ТОКЕНА
        // Полезная нагрузка (payload) для токена
        const payload = { 
            userId: user._id, 
            role: user.role 
        }; 

        // Создаем токен, подписывая его секретным ключом
        const token = jwt.sign(
            payload, 
            JWT_SECRET, 
            { expiresIn: '1h' } // Срок действия токена: 1 час
        );

        // 4. ОТВЕТ КЛИЕНТУ
        // Отправляем токен обратно в Angular
        res.json({ token: token, message: 'Вход успешен!' });

    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера.' });
    }
});

module.exports = router;