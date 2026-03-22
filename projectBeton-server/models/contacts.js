const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Определяем структуру документа в коллекции contacts
const ContactSchema = new Schema({
    // Поле для хранения номера телефона (обязательное, уникальное)
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },

    phoneHref: {
        type: String,
        required: true,
        unique: true
    },

    // Поле для типа контакта, чтобы отличить основной номер от других
    type: {
        type: String,
        required: true,
        default: 'main'
    }
}, {
    collection: 'contacts'
});

// Экспортируем модель Mongoose, чтобы ее можно было использовать в server.js
module.exports = Contacts = mongoose.model('Contacts', ContactSchema);