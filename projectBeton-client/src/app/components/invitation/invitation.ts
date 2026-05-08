import { Component, signal} from '@angular/core';
import { ContactButton } from '../contact-button/contact-button';
import { FormInvitation } from '../form-invitation/form-invitation';


@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [ContactButton, FormInvitation],
  templateUrl: './invitation.html',
  styleUrl: './invitation.less'
})
export class Invitation {

isDivVisible = signal(true);

hideDiv() {
  this.isDivVisible.set(false);
}

showContactModal = signal(false);

  openModal(): void {
    this.showContactModal.set(true);
  }

  closeModal(): void {
    this.showContactModal.set(false);
  }

  onConditionsLink(event: Event): void {
    event.preventDefault();
    this.openModal();
  }
}
