import { Component, signal, ElementRef, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navigation-bar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navigation-bar.html',
  styleUrl: './navigation-bar.less'
})
export class NavigationBar {

isMenuOpen = signal(false);

constructor(private el: ElementRef) {}

toggleMenu() {
  this.isMenuOpen.update(value => !value);
}

closeMenu() {
  this.isMenuOpen.set(false);
}

 @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Проверяем:
    // 1. Открыто ли меню?
    // 2. Был ли клик сделан ВНЕ текущего компонента (кнопка гамбургер и само меню)
    if (this.isMenuOpen() && !this.el.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
    // Если вы хотите исключить кнопку калькулятора, вам нужно будет добавить более сложную логику, 
    // но для начала этого достаточно.
  }
}
