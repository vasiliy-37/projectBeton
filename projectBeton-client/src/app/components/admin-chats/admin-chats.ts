import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-admin-chats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-chats.html',
  styleUrl: './admin-chats.less'
})
export class AdminChatsComponent implements OnInit {

  constructor() {
    // МАГИЯ ЗДЕСЬ: Следим за новыми сообщениями в открытом чате
    effect(() => {
      const messages = this.chatService.messages(); // Подписываемся на сообщения
      const currentChatId = this.selectedChatId();  // И на текущий выбор

      if (currentChatId && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];

        // Если последнее сообщение пришло от юзера, а мы в этом чате — обнуляем!
        if (lastMsg.sender === 'user') {
          this.chatService.markAsRead(currentChatId);

          // И сразу обновляем локальный список для мгновенной реакции UI
          this.chatService.activeChats.update(chats =>
            chats.map(c => c.guestId === currentChatId ? { ...c, unreadCount: 0 } : c)
          );
        }
      }
    });
  }

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
    // Помечаем как прочитанное (вызываем метод сервиса)
    this.chatService.markAsRead(guestId);
    // 2. Локально обнуляем для мгновенного эффекта
    this.chatService.activeChats.update(chats =>
      chats.map(chat =>
        chat.guestId === guestId ? { ...chat, unreadCount: 0 } : chat
      )
    );
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