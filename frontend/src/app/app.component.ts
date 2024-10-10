import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from "./main/navbar/navbar.component";
import { HeaderComponent } from "./main/header/header.component";
import { AboutComponent } from "./main/about/about.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { CarsComponent } from "./main/cars/cars.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, HeaderComponent, AboutComponent, FooterComponent, CarsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'TurboRent';
}
