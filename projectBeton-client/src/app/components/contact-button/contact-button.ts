import { Component, output, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-contact-button',
  imports: [],
  templateUrl: './contact-button.html',
  styleUrl: './contact-button.less'
})
export class ContactButton {
  @Output() openModal = new EventEmitter<void>()
}
