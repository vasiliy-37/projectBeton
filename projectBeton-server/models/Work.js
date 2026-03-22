const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageData: { type: String, required: true }, // Сюда пойдет Base64
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Work', workSchema);