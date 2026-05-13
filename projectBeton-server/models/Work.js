const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
    title: { type: String, required: true },
    /** Публичный URL файла, например /uploads/works/<uuid>.webp */
    imageUrl: { type: String },
    /** Устарело: старые записи с картинкой в Base64 в JSON */
    imageData: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Work', workSchema);