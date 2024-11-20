import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecurityComponent {
  private router = inject(Router)
  private userService = inject(UserService)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private snackbarService = inject(SnackbarService)

  securityForm = new FormGroup({
    oldpassword: new FormControl('', { validators: [Validators.required] }),
    newpassword: new FormControl('', { validators: [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)] })
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

  errText:string=""
  submitErr:boolean=false;

  onEditPassword() {
    if(this.securityForm.valid) {
      const subscription = this.userService.editUserPassword({
        id: this.authService.getUserDataFromToken().id,
        oldpassword: this.securityForm.value.oldpassword,
        newpassword: this.securityForm.value.newpassword
      }).subscribe({
        next: (res:any) => {
          this.authService.logOut()
          this.snackbarService.show("Sikeres jelszó változtatás!")
          this.submitErr=false
        },
        error: (err) => {
          this.snackbarService.show("Hiba a jelszó változtatása közben!", "danger")
          this.errText = "Töltsd ki a kritériumoknak megfelelően!"
          this.submitErr=true
        }
      })
  
      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    } 

    this.snackbarService.show("Hiba a jelszó változtatása közben!", "danger")
    this.errText = "Töltsd ki a kritériumoknak megfelelően!"
    this.submitErr=true
  }

}
