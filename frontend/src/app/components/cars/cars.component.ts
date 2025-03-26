import { Component, DestroyRef, inject, NgZone, OnInit } from '@angular/core';
import { CarComponent } from "./car/car.component";
import { AboutComponent } from "../about/about.component";
import { CarsService } from '../../services/cars.service';
import { HeaderComponent } from "../header/header.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { Router } from '@angular/router';
import { CarFilterPipe } from '../../Pipes/car-filter.pipe';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CarComponent, AboutComponent, HeaderComponent, CarFilterPipe, FormsModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent implements OnInit {
  private destroyRef = inject(DestroyRef)
  private carsService = inject(CarsService)
  private router = inject(Router);

  cars:any;
  brands:any;
  categories:any;

  selectedBrand: string = '';
  selectedType: string = '';
  selectedOrder: string = 'asc';

  onClick(carId:number) {
    this.router.navigate(["/cars/" + carId])
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

    this.destroyRef.onDestroy(() => subscription.unsubscribe())

    const getBrands = this.carsService.getBrandList().subscribe({
      next: (brands) => {
        this.brands=brands;
      },
      error: (err) => {
        console.log("ERROR: " + err)
      }
    })

    this.destroyRef.onDestroy(() => getBrands.unsubscribe())

    const getCategories = this.carsService.getCategoryList().subscribe({
      next: (categories) => {
        this.categories=categories;
      },
      error: (err) => {
        console.log("ERROR: " + err)
      }
    })

    this.destroyRef.onDestroy(() => getCategories.unsubscribe())
  }
}
