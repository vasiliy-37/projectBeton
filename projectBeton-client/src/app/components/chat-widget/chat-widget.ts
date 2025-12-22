import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.less' // или .css
})
export class ChatWidgetComponent {
  chatService = inject(ChatService); // Внедряем наш сервис
  
  isOpen = signal(false); // Состояние: открыт чат или закрыт
  newMessage = ''; // Текст в поле ввода

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  send() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage);
      this.newMessage = ''; // Очищаем поле после отправки
    }
  }
}