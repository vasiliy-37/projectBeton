import { Component, output, EventEmitter, Output } from '@angular/core';
import { FormInvitation } from '../form-invitation/form-invitation';

@Component({
  selector: 'app-contact-button',
  imports: [FormInvitation],
  templateUrl: './contact-button.html',
  styleUrl: './contact-button.less'
})
export class ContactButton {
  @Output() openModal = new EventEmitter<void>()
}
