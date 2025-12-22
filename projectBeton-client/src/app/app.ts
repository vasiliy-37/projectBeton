import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Invitation } from './components/invitation/invitation';
import { NavigationBar } from './components/navigation-bar/navigation-bar';
import { Calculator } from './components/calculator/calculator';
import { ContactButton } from './components/contact-button/contact-button';
import { FormInvitation } from './components/form-invitation/form-invitation';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Invitation, NavigationBar, Calculator, ContactButton, FormInvitation, Header, Footer, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  protected readonly title = signal('projectBeton-client');
}
