import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../shared/snackbar/snackbar.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService)
  private userService = inject(UserService)
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

  resetPasswordForm = new FormGroup({
    email: new FormControl('', { validators: [ Validators.email, Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/) ]})
  })

  isSubmitted=false;
  loginError=false;
  errorText=""

  openDialog() {
    const dialog = document.getElementById("resetPasswordDialog") as HTMLElement
    
    dialog.style.visibility = "unset"
  }

  hideDialog() {
    const dialog = document.getElementById("resetPasswordDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
  }
  
  dialogErr:string=""

  resetPassword() {
    if(this.resetPasswordForm.invalid) {
      this.dialogErr="Hibás email cím."
      return;
    }

    const subscription = this.userService.requestResetPassword(
      { email: this.resetPasswordForm.value.email }).subscribe({
        next: (res) =>{
          this.snackbarService.show("Email elküldésre került.")
          this.resetPasswordForm.reset()
          this.hideDialog()
        },
        error: (err) => {
          this.dialogErr="Az email cím nem létezik!"
        }
    })
  }

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
