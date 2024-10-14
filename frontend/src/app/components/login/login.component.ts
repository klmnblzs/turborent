import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  private router = inject(Router);
  showPassword:boolean = false;

  form = new FormGroup({
    email: new FormControl('', {
      validators: [ Validators.email, Validators.required, Validators.minLength(10), Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/) ]
    }),
    password: new FormControl('', {
      validators: [ Validators.required ]
    })
  })

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

  isSubmitted=false;
  loginError=false;

  onSubmit() {
    this.isSubmitted=true;
    if(this.form.controls.email.invalid || this.form.controls.password.invalid) {
      return;
    }

    const subscription = this.loginCustomer().subscribe({
      next: (res) => {
        this.router.navigate(['/'])
        console.log(res)
      },
      error: (err) => {
        this.loginError = true;
      }
    })

    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe()
    })
  
  }
}
