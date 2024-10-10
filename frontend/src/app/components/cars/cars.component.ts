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

  ngOnInit(): void {
    const subscription = this.carsService.getCarList().subscribe({
      next: (res) => {
        this.cars=res
      },
      error: (err) => {
        console.log("ERROR:" + err)
      }
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }
}
