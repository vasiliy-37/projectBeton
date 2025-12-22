import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-admin-chats',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-chats.html',
  styleUrl: './admin-chats.less'
})
export class AdminChatsComponent implements OnInit {
  chatService = inject(ChatService);
  
  activeChats = signal<any[]>([]); // Список сессий из базы
  selectedChatId = signal<string | null>(null); // Кого выбрали для ответа
  adminMessage = '';

  ngOnInit() {
    // 1. Просим у сервера список всех активных чатов
    this.chatService.getAdminChatList();

    // 2. Слушаем обновление этого списка
    // (Добавим этот метод в сервис на следующем шаге)
    this.chatService.listenToChatList((chats) => {
      this.activeChats.set(chats);
    });
  }

  selectChat(guestId: string) {
    this.selectedChatId.set(guestId);
    this.chatService.adminJoinChat(guestId); // Входим в комнату гостя
  }

sendResponse() {
  if (!this.adminMessage.trim() || !this.selectedChatId()) return;

  const data = {
    guestId: this.selectedChatId(),
    text: this.adminMessage,
    sender: 'admin' 
  };

  // Отправляем через сокет
  this.chatService.sendAdminMessage(data);
  this.adminMessage = ''; // Чистим поле
}
}