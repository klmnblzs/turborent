import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CarUploadComponent } from "./admin/car-upload/car-upload.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CarUploadComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router)
  private userService = inject(UserService)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private activatedRoute = inject(ActivatedRoute)
 
  userData = this.authService.getUserDataFromToken()
  currentPage:string = 'data';

  // FORM SZERKESZTÉS

  dataForm = new FormGroup({
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    postcode: new FormControl(0),
    city: new FormControl(''),
    street: new FormControl(''),
    housenum: new FormControl('')
  })

  securityForm = new FormGroup({
    oldpassword: new FormControl(''),
    newpassword: new FormControl('')
  })

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if(params.get("userid") != this.authService.getUserDataFromToken().id) {
        this.router.navigate(['/dashboard/' + this.authService.getUserDataFromToken().id])
      }
    })

    const subscription = this.userService.getUserData(this.authService.getUserDataFromToken().id).subscribe({
      next: (res: any) => {
        this.dataForm.patchValue({
          firstname: this.userData.firstname,
          lastname: this.userData.lastname,
          postcode: this.userData.postcode,
          city: this.userData.city,
          street: this.userData.street,
          housenum: this.userData.housenumber
        })
      }
    })

    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }


  logOut() {
    this.router.navigate(["/logout"])
  }
}
