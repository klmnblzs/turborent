import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form = new FormGroup({
    email: new FormControl('', {
      validators: [ Validators.email, Validators.required, Validators.minLength(10) ]
    }),
    password: new FormControl('', {
      validators: [ Validators.required, Validators.minLength(8) ]
    })
  })

  onSubmit() {
    // 
  }
}
