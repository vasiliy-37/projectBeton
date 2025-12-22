import { Injectable, signal, effect } from '@angular/core';
import { io, Socket } from 'socket.io-client';

interface Message {
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})

export class ChatService {
  private socket: Socket;
  private url = 'http://localhost:3000'; // URL твоего сервера

  // 1. Уникальный ID гостя (берем из памяти или создаем новый)
  private guestId = localStorage.getItem('guestId') || this.generateId();

  // 2. Сигнал для сообщений (чтобы Angular сразу видел обновления)
  messages = signal<Message[]>([]);

  constructor() {
    // Сохраняем ID, чтобы чат не пропадал при перезагрузке
    localStorage.setItem('guestId', this.guestId);

    // Подключаемся к серверу
    this.socket = io(this.url);

    this.socket.on('chat_history', (history: Message[]) => {
      // Просто заменяем пустой массив сообщений на то, что пришло из базы
      this.messages.set(history);
    });

    // Как только подключились — заходим в свою комнату
    this.socket.on('connect', () => {
      this.socket.emit('join_chat', this.guestId);
    });

    // Слушаем входящие сообщения
    this.socket.on('receive_message', (msg: Message) => {
      this.messages.update(prev => [...prev, msg]);
    });
  }

  // Метод для генерации случайного ID анонима
  private generateId(): string {
    return 'guest_' + Math.random().toString(36).substring(2, 11);
  }

  // Попросить список чатов
getAdminChatList() {
  this.socket.emit('admin_get_all_chats');
}

// Слушать список чатов
listenToChatList(callback: (chats: any[]) => void) {
  this.socket.on('admin_chat_list', callback);
}

// Админ заходит в комнату конкретного гостя
adminJoinChat(guestId: string) {
  this.socket.emit('admin_join_guest_chat', guestId);
  // Очищаем текущий экран сообщений и ждем историю этого гостя
  this.messages.set([]); 
}

sendAdminMessage(data: any) {
  this.socket.emit('send_message', data);
}

  // Метод отправки сообщения
  sendMessage(text: string) {
    if (!text.trim()) return;

    const data = {
      guestId: this.guestId,
      text: text
    };

    this.socket.emit('send_message', data);
  }
}