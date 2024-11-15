import { Component, DestroyRef, inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarsService } from '../../../../services/cars.service';

@Component({
  selector: 'app-car-upload',
  standalone: true,
  imports: [],
  templateUrl: './car-upload.component.html',
  styleUrl: './car-upload.component.scss'
})
export class CarUploadComponent implements OnInit {
  private destroyRef = inject(DestroyRef)
  private carsService = inject(CarsService)
  private router = inject(Router)

  cars:any;
  
  ngOnInit(): void {
    const subscription = this.carsService.getCarList().subscribe({
      next: (cars) => {
        this.cars=cars
      },
      error: (err) => {
        console.log("ERROR:" + err)
      }
    })
  }
}
