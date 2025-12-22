// Импортируем модель, которую мы создали в Шаге 1
const ChatSession = require('../models/ChatSession');

/**
 * Функция для сохранения сообщения и обновления таймера чата
 * @param {string} guestId - уникальный ID анонимного пользователя
 * @param {object} messageData - объект сообщения { text, sender }
 */
const saveMessage = async (guestId, messageData) => {
  try {
    const updatedChat = await ChatSession.findOneAndUpdate(
      { guestId: guestId }, 
      { 
        $push: { messages: messageData }, // Добавляем сообщение в массив
        $set: { lastActivity: new Date() } // Сбрасываем таймер удаления (TTL) на 1 час
      },
      { 
        upsert: true, // Создать чат, если его нет
        new: true     // Вернуть уже обновленный документ
      }
    );
    return updatedChat;
  } catch (error) {
    console.error("Ошибка в chatController:", error);
    throw error; // Пробрасываем ошибку дальше, чтобы сервер знал о ней
  }
};

const getChatByGuestId = async (guestId) => {
  try {
    return await ChatSession.findOne({ guestId: guestId });
  } catch (error) {
    console.error("Ошибка при поиске чата:", error);
    return null;
  }
};

const getAllActiveChats = async () => {
  try {
    // Находим все сессии и сортируем по последней активности (свежие сверху)
    return await ChatSession.find().sort({ lastActivity: -1 });
  } catch (error) {
    console.error("Ошибка получения всех чатов:", error);
    return [];
  }
};

module.exports = {
  saveMessage,
  getChatByGuestId,
  getAllActiveChats
};