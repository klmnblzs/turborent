import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CarComponent } from "./car/car.component";
import { AboutComponent } from "../about/about.component";
import { CarsService } from '../../services/cars.service';
import { HeaderComponent } from "../header/header.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CarComponent, AboutComponent, HeaderComponent, NavbarComponent],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent implements OnInit {
  private destroyRef = inject(DestroyRef)
  private carsService = inject(CarsService)

  cars:any;
  brands:any;
  categories:any;

  onClick(carId:number) {
    console.log(this.cars.find( (car:any)=>car.id==carId) )
  }

  ngOnInit(): void {
    const subscription = this.carsService.getCarList().subscribe({
      next: (cars) => {
        this.cars=cars
      },
      error: (err) => {
        console.log("ERROR:" + err)
      }
    })

    const getBrands = this.carsService.getBrandList().subscribe({
      next: (brands) => {
        this.brands=brands;
      },
      error: (err) => {
        console.log("ERROR: " + err)
      }
    })

    const getCategories = this.carsService.getCategoryList().subscribe({
      next: (categories) => {
        this.categories=categories;
      },
      error: (err) => {
        console.log("ERROR: " + err)
      }
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
      getBrands.unsubscribe()
      getCategories.unsubscribe()
    })
  }
}