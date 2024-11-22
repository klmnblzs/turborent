import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute)
  private destroyRef = inject(DestroyRef)
  private usersService = inject(UserService)
  private authService = inject(AuthService)
  private snackbarService = inject(SnackbarService)
  private router = inject(Router)

  resetPasswordForm = new FormGroup({
    password: new FormControl('', { validators: [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)] }),
    confirmPassword: new FormControl('')
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

  customerId:any;
  tokenId:any;

  errorMessage:string=""

  ngOnInit() {
    const token = this.activatedRoute.snapshot.queryParamMap.get('token');
    console.log(token)

    if(!token || this.authService.getUserDataFromToken()) {
      this.router.navigate(["/cars"])
      return;
    }

    const subscription = this.usersService.validateToken(token).subscribe({
      next: (res:any) => {
        this.customerId = res.customer_id
        this.tokenId = res.token_id

        if(!this.customerId || !this.tokenId) {
          this.router.navigate(["/cars"])
        }
      }
    })

    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

  isMatchingPassword() {
    return this.resetPasswordForm.value.password === this.resetPasswordForm.value.confirmPassword
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid || !this.tokenId || !this.customerId) {
      this.errorMessage="Töltse ki a kritériumoknak megfelelően."
      return;
    }

    if(this.resetPasswordForm.valid && !this.isMatchingPassword()) {
      this.errorMessage="A két jelszó nem egyezik meg."
      return;
    }


    const subscription = this.usersService.resetPassword({
      token: this.activatedRoute.snapshot.queryParamMap.get('token'),
      customer_id: this.customerId,
      password: this.resetPasswordForm.value.password
    }).subscribe({
      next: (res) => {
        this.router.navigate(["/login"])
        this.snackbarService.show("Jelszó visszaállítva!")
      }
    })
  }
} 
