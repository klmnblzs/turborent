import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private customersService = inject(CustomersService);
  private destroyRef = inject(DestroyRef);
  showPassword:boolean = false;

  form = new FormGroup({
    email: new FormControl('', {
      validators: [ Validators.email, Validators.required, Validators.minLength(10), Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/) ]
    }),
    password: new FormControl('', {
      validators: [ Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/) ]
    })
  })

  hasUpperCase(str: string | null) {
    return str ? /[A-Z]/.test(str) : false;
  }

  hasNumber(str: string | null) {
    return str ? /\d/.test(str) : false;
  }

  hasSpecialCharacter(str:string | null) {
    return str ? /[!@#$%^&*]/.test(str) : false
  }

  loginCustomer() {
    return this.customersService.postRequest(
      "http://localhost:3000/customers/login",
      {
        email: this.form.value.email,
        password: this.form.value.password
      },
      "Could not log in customer"
    )
  }

  invalidEmail:boolean = false;
  invalidPassword:boolean = false;

  onSubmit() {
    if(this.form.controls.email.invalid || this.form.controls.password.invalid) {
      return;
    }

    const subscription = this.loginCustomer().subscribe({
      next: (res) => {
        console.log(res)
      }
    })

    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe()
    })
  
  }
}
