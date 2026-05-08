import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-grade-guide',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-grade-guide.html',
  styleUrl: './home-grade-guide.less'
})
export class HomeGradeGuide {}
