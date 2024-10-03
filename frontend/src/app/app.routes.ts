import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CarsComponent } from './main/cars/cars.component';
import { ContactComponent } from './main/contact/contact.component';
import { LoginComponent } from './main/login/login.component';
import { RegisterComponent } from './main/register/register.component';
import { CarAboutComponent } from './main/cars/car-about/car-about.component';

const header:string = "TurboRent | "

export const routes: Routes = [
    { path: '', component: CarsComponent, title: header + "Autóink" },
    { path: 'cars', component: CarsComponent, title: header + "Autóink" },
    { path: 'contact', component: ContactComponent, title: header + "Kapcsolat" },
    { path: 'login', component: LoginComponent, title: header + "Bejelentkezés" },
    { path: 'register', component: RegisterComponent, title: header + "Regisztráció"},

    { path: 'about', component: CarAboutComponent }
];
