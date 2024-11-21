import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService)
  private snackbarService = inject(SnackbarService)

  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  showPassword:boolean = false;

  ngOnInit(): void {
    if(localStorage.getItem("token") && localStorage.getItem("refreshToken")) {
      this.router.navigate(["/dashboard"])
    }
  }

  form = new FormGroup({
    email: new FormControl('', {
      validators: [ Validators.email, Validators.required, Validators.minLength(10), Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/) ]
    }),
    password: new FormControl('', {
      validators: [ Validators.required ]
    })
  })

  isSubmitted=false;
  loginError=false;
  errorText=""

  onSubmit() {
    this.isSubmitted=true;
    if(this.form.controls.email.invalid || this.form.controls.password.invalid) {
      this.loginError = true;
      this.errorText = "Hibás email vagy jelszó!"
      return;
    }

    const subscription = this.authService.loginUser({
      email: this.form.value.email,
      password: this.form.value.password
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem("token", res.token)
        localStorage.setItem("refreshToken", res.refreshToken)

        if(this.authService.getUserDataFromToken().isApproved == 0) {
          this.loginError=true
          this.errorText = "A regisztrációd jóváhagyásra vár."
          
          this.authService.logoutUser({
            refreshToken: localStorage.getItem("refreshToken")
          }).subscribe({
            next: (res) => {
              localStorage.removeItem("token")
              localStorage.removeItem("refreshToken")
            }
          })

          return;
        }

        setTimeout(() => {
          this.router.navigate(["/dashboard/" + localStorage.getItem("userid")])
          this.snackbarService.show("Sikeres bejelentkezés!")
        })
      }, error: (err) => {
        this.loginError=true
        this.errorText = "Hiba a bejelentkezés során!"
      }
    })

    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe()
    })
  
  }
}
