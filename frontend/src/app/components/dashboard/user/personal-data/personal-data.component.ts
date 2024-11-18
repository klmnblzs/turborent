import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss'
})
export class PersonalDataComponent {
  private router = inject(Router)
  private userService = inject(UserService)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private activatedRoute = inject(ActivatedRoute)
  private snackbarService = inject(SnackbarService)
 
  userData = this.authService.getUserDataFromToken()

  // FORM SZERKESZTÉS

  dataForm = new FormGroup({
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    postcode: new FormControl(0),
    city: new FormControl(''),
    street: new FormControl(''),
    housenum: new FormControl('')
  })

  loadUserData() {
    const subscription = this.userService.getUserData(this.authService.getUserDataFromToken().id).subscribe({
      next: (res: any) => {
        this.userData.firstname = res.first_name
        this.userData.lastname = res.last_name
        this.userData.postcode = res.post_code
        this.userData.city = res.city
        this.userData.street = res.street
        this.userData.housenumber = res.house_number

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

  editCustomerData() {
    const subscription = this.userService.editUserData({
      firstname: this.dataForm.value.firstname,
      lastname: this.dataForm.value.lastname,
      postcode: this.dataForm.value.postcode,
      city: this.dataForm.value.city,
      street: this.dataForm.value.street,
      housenum: this.dataForm.value.housenum,
      id: this.authService.getUserDataFromToken().id
    }).subscribe({
      next: (res:any) => {
        this.snackbarService.show("Adatok frissítve! Jelentkezz be újra.")
        this.router.navigate(["/logout"])
      },
      error: (err) => {
        this.snackbarService.show("Hiba a frissítés során!", "danger")
      }
    })
    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if(params.get("userid") != this.authService.getUserDataFromToken().id) {
        this.router.navigate(['/dashboard/' + this.authService.getUserDataFromToken().id])
      }
    })

    this.loadUserData()
  }

  logOut() {
    this.router.navigate(["/logout"])
  }
}
