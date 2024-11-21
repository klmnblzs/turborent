import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CarsService } from '../../../services/cars.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { SnackbarService } from '../../shared/snackbar/snackbar.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

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
  private userService = inject(UserService)


  carId:any;
  carData:any;

  // RENT FORM

  rentForm = new FormGroup({
    pickupDate: new FormControl('', { validators: Validators.required }),
    deliverDate: new FormControl('', { validators: Validators.required })
  })

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

  rentError:boolean=false;
  errorText:string="";

  rentCar() {
    if(localStorage.getItem("token")) { 
      if(this.rentForm.valid) {
        const checkAvailable = this.carsService.checkAvailable({
          car_id: this.carId,
          start_date: this.rentForm.value.pickupDate,
          end_date: this.rentForm.value.deliverDate
        }).subscribe({
          next: (res) => {
            const subscription = this.userService.createRentRequest({
              car_id: this.carId,
              customer_id: this.authService.getUserDataFromToken().id,
              rent_from: this.rentForm.value.pickupDate,
              rent_to: this.rentForm.value.deliverDate
            }).subscribe({
              next: (res) => {
                this.snackbarService.show("Kérés leadva!")
                this.rentForm.reset()
              }
            })
            this.destroyRef.onDestroy(() => subscription.unsubscribe())
          },
          error: (err) => {
            this.snackbarService.show("Hiba a kérés leadása során!", "danger")
            this.errorText="Erre az időpontra már lefoglalták az autót."
            this.rentError=true
          }
        })
        this.destroyRef.onDestroy(() => checkAvailable.unsubscribe())
      } else {
        this.snackbarService.show("Hiba a kérés leadása során!", "danger")
        this.errorText="Tölts ki minden mezőt!"
        this.rentError=true
      }

    } else {
      // TODO: javítani a redirectet --> most refreshel, redirect helye
      this.router.navigate(["/login"]) 
    }
  } 
  
  carEquipments:any;
  displayEquipments(carData:Array<any>) {
    this.carEquipments = carData[0].equipments.split(";")
  }

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
