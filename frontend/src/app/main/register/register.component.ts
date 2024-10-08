import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
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

  onSubmit() {
    console.log(this.form)
  }
}
