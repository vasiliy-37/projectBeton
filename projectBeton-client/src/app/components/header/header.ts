import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { NavigationBar } from '../navigation-bar/navigation-bar';
import { PhoneDisplay } from '../phone-display/phone-display';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NavigationBar, PhoneDisplay],
  templateUrl: './header.html',
  styleUrl: './header.less'
})
export class Header {
  private router = inject(Router);

  goToCalculator(event: Event): void {
    event.preventDefault();

    const onHomePage = this.router.url === '/' || this.router.url.startsWith('/#');
    if (onHomePage) {
      this.scrollToCalculator();
      return;
    }

    this.router.navigate(['/'], { fragment: 'calculator' }).then(() => {
      setTimeout(() => this.scrollToCalculator(), 0);
    });
  }

  private scrollToCalculator(): void {
    const calculatorSection = document.getElementById('calculator');
    if (!calculatorSection) {
      return;
    }
    calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
