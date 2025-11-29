import { Component} from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NavigationBar } from '../navigation-bar/navigation-bar';
import { PhoneDisplay } from '../phone-display/phone-display';

@Component({
  selector: 'app-header',
  imports: [RouterLinkActive, RouterLink, NavigationBar, PhoneDisplay],
  templateUrl: './header.html',
  styleUrl: './header.less'
})
export class Header {
 
}
