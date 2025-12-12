const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Логин должен быть уникальным
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin' // Жестко задаем роль "admin", так как регистрация не нужна
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);