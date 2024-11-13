import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CarsService } from '../../../services/cars.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-car-about',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './car-about.component.html',
  styleUrl: './car-about.component.scss'
})
export class CarAboutComponent implements OnInit{
  private carsService = inject(CarsService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router)

  carId:any;
  carData:any;

  isLoggedIn() {
    const token = localStorage.getItem("token")
    if(token) {
      
      return true
    } 
    return false
  }

  redirectCustomer() {
    if(!this.isLoggedIn()) { /* TODO: Átirányítani a felhasználót a bérlés leadásához */ }
    else {
      // TODO: javítani a redirectet --> most refreshel, redirect helyett
      this.router.navigate(["/login"]) 
    }
  } 

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
