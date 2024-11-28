import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  private router = inject(Router)

  ngOnInit(): void {
    this.router.navigate(["/cars"])
  }
}
