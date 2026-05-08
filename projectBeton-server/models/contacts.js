const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Определяем структуру документа в коллекции contacts
const ContactSchema = new Schema({
    // Поле для хранения номера телефона (обязательное, уникальное)
    phoneNumber: {
        type: String,
        default: ''
    },

    phoneHref: {
        type: String,
        default: ''
    },

    emails: {
        type: [String],
        default: []
    },

    address: {
        type: String,
        default: ''
    },

    mapEmbedUrl: {
        type: String,
        default: ''
    },

    // Поле для типа контакта, чтобы отличить основной номер от других
    type: {
        type: String,
        default: 'main'
    }
}, {
    collection: 'contacts'
});

// Экспортируем модель Mongoose, чтобы ее можно было использовать в server.js
module.exports = Contacts = mongoose.model('Contacts', ContactSchema);