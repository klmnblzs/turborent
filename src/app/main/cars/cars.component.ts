import { Component, computed, inject, input } from '@angular/core';
import { CarComponent } from "./car/car.component";
import { AboutComponent } from "../about/about.component";
import { CarsService } from './cars.service';
import { carData } from './car/car.model';
import { HeaderComponent } from "../header/header.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CarComponent, AboutComponent, HeaderComponent, NavbarComponent],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent {
  private carsService = inject(CarsService);
  carId = input.required<string>()

  getCarList = computed(() => this.carsService.getCarList())
  getBrandList = computed(() => this.carsService.getBrandList())
  getTypeList = computed(() => this.carsService.getTypeList())

  onClickCard(carId:string) {
    console.log(this.carsService.getSelectedCarData(carId));
  }
}
