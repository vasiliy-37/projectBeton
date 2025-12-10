import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.less'
})
export class AdminLayout {
constructor(private router: Router) {}

  goToPublic() {
    this.router.navigate(['/']); 
  }
}
