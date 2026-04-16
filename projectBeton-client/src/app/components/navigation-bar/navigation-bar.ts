import { Component, signal, ElementRef, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navigation-bar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navigation-bar.html',
  styleUrl: './navigation-bar.less'
})
export class NavigationBar {

isMenuOpen = signal(false);
isPriceMenuOpen = signal(false);

constructor(private el: ElementRef, private router: Router) {}

toggleMenu() {
  this.isMenuOpen.update(value => !value);
}

togglePriceMenu() {
  this.isPriceMenuOpen.update(value => !value);
}

closeMenu() {
  this.isMenuOpen.set(false);
  this.isPriceMenuOpen.set(false);
}

isPriceSectionActive(): boolean {
  return this.router.url.startsWith('/price') || this.router.url.startsWith('/services');
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
