import { Component } from '@angular/core';
import { ServiceList } from '../service-list/service-list';

@Component({
  selector: 'app-services',
  imports: [ServiceList],
  templateUrl: './services.html',
  styleUrl: './services.less'
})
export class Services {

}
