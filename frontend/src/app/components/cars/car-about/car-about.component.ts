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
  
  carId:any;
  carData:any;

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.carId = params.get('id');
    });

    const subscription = this.carsService.getCarById(this.carId).subscribe({
      next: (res) => { 
        this.carData = res;
        console.log(this.carData)
      },
      error: (err) => {
        console.error('Error fetching car:', err);
      }
    });

    this.destroyRef.onDestroy(() => { 
      subscription.unsubscribe()
    })
  }
}
