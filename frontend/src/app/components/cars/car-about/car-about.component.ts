import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CarsService } from '../../../services/cars.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-car-about',
  standalone: true,
  imports: [RouterOutlet, DecimalPipe],
  templateUrl: './car-about.component.html',
  styleUrl: './car-about.component.scss'
})
export class CarAboutComponent implements OnInit{
  private carsService = inject(CarsService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  car:any;
  carId:any;

  getCarById(id: string) {
    return this.carsService.fetchById(
      "http://localhost:3000/cars",
      "There was an error",
      id
    )
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.carId = params.get('id');  // "id" matches the ':id' in your route
      this.getCarById(this.carId);
    });

    const subscription = this.getCarById(this.carId).subscribe({
      next: (res) => {
        this.car=res;
      }
    })

    this.destroyRef.onDestroy(() => subscription.unsubscribe)
  }
}
