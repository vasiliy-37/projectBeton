const mongoose = require('mongoose');

// Описываем схему
const chatSessionSchema = new mongoose.Schema({
  // Уникальный ключ анонима. По нему мы будем находить чат в базе.
  guestId: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // Массив всех сообщений в этом чате
  messages: [
    {
      text: { type: String, required: true },
      sender: { type: String, enum: ['user', 'admin'], required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],

  // Поле для авто-удаления (TTL индекс)
  lastActivity: { 
    type: Date, 
    default: Date.now, 
    index: { expires: '1h' } 
  }
});

// Создаем модель и экспортируем её
module.exports = mongoose.model('ChatSession', chatSessionSchema);