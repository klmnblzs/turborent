import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CarsComponent } from './components/cars/cars.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CarAboutComponent } from './components/cars/car-about/car-about.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const header:string = "TurboRent | "

export const routes: Routes = [
    { path: '', component: CarsComponent, title: header + "Autóink" },
    { path: 'cars', component: CarsComponent, title: header + "Autóink" },
    { path: 'cars/:id', component: CarAboutComponent, pathMatch: "full", title: header + "Autóink" },
    { path: 'contact', component: ContactComponent, title: header + "Kapcsolat" },
    { path: 'login', component: LoginComponent, title: header + "Bejelentkezés" },
    { path: 'register', component: RegisterComponent, title: header + "Regisztráció"},
    { path: 'dashboard', component: DashboardComponent, title: header + "Dashboard" },
    { path: '**', component: CarsComponent },
    { path: 'about', component: CarAboutComponent }
];
