import { Component, Input} from '@angular/core';
import { WindowData } from '../home/home';

// export interface WindowData {
//   logoUrl: string;
//   caption: string;
// }

@Component({
  selector: 'app-cards-about-us',
  imports: [],
  templateUrl: './cards-about-us.html',
  styleUrl: './cards-about-us.less'
})
export class CardsAboutUs {
@Input() 
  windowsData: WindowData[] = [];
}
