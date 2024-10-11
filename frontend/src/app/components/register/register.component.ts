import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private customersService = inject(CustomersService);

  form = new FormGroup({
    firstname: new FormControl('', {
      validators: [Validators.required]
    }),
    lastname: new FormControl('', {
      validators: [Validators.required]
    }),
    email: new FormControl('', {
      validators: [Validators.email, Validators.required]
    }),
    phone: new FormControl('', {
      validators: [Validators.required]
    }),
    licensePictureFront: new FormControl('', {
      validators: [Validators.required]
    }),
    licensePictureBack: new FormControl('', {
      validators: [Validators.required]
    }),
    city: new FormControl('', {
      validators: [Validators.required]
    }),
    postcode: new FormControl('', {
      validators: [Validators.required]
    }),
    address: new FormControl('', {
      validators: [Validators.required]
    }),
    housenum: new FormControl('', {
      validators: [Validators.required]
    }),
    dateofbirth: new FormControl('', {
      validators: [Validators.required]
    }),
    password: new FormControl('', {
      validators: [Validators.required]
    }),
    passwordConfirm: new FormControl('', {
      validators: [Validators.required]
    })
  })

  registerCustomer() {
    return this.customersService.postRequest(
      "http://localhost:3000/customers/register",
      {
        first_name: this.form.value.firstname,
        last_name: this.form.value.lastname,
        email: this.form.value.email,
        phone_number: this.form.value.phone,
        driver_license_picture_front: this.form.value.licensePictureFront,
        driver_license_picture_back: this.form.value.licensePictureBack,
        date_of_birth: this.form.value.dateofbirth,
        post_code: this.form.value.postcode,
        city: this.form.value.city,
        street: this.form.value.address,
        house_number: this.form.value.housenum,
        password: this.form.value.password,
        isApproved: 0,
        isAdmin: 0
      },
      "Could not register customer"
    )
  }

  onSubmit() {
    const subscription = this.registerCustomer().subscribe({
      next: (res) => {
        console.log(res)
        this.form.reset()
      }
     })
     this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe()
     })
  }
}
