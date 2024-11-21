import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CarsService } from '../../../services/cars.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { SnackbarService } from '../../shared/snackbar/snackbar.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-car-about',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule],
  templateUrl: './car-about.component.html',
  styleUrl: './car-about.component.scss'
})
export class CarAboutComponent implements OnInit{
  private carsService = inject(CarsService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService)
  private router = inject(Router)
  private snackbarService = inject(SnackbarService)


  carId:any;
  carData:any;
  

  isLoggedIn() {
    const token = localStorage.getItem("token")
    if(token) {
      if(this.authService.getUserDataFromToken().isApproved == 1) {
        return true
      } else {
        return "unapproved"
      }
    } 
    return false
  }

  redirectCustomer() {
    if(localStorage.getItem("token")) { /* TODO: Átirányítani a felhasználót a bérlés leadásához */ }
    else {
      // TODO: javítani a redirectet --> most refreshel, redirect helyett
      this.router.navigate(["/login"]) 
    }
  } 
  
  carEquipments:any;
  displayEquipments(carData:Array<any>) {
    this.carEquipments = carData[0].equipments.split(";")
  }

  // RENT FORM

  rentForm = new FormGroup({
    pickupDate: new FormControl(''),
    deliverDate: new FormControl('')
  })

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.carId = params.get('id');
    });

    const subscription = this.carsService.getCarById(this.carId).subscribe({
      next: (res: any) => { 
        this.carData = res;
        this.displayEquipments(res)
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
