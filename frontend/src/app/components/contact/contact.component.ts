import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required]
    }),
    email: new FormControl('', {
      validators: [Validators.email, Validators.required]
    }),
    subject: new FormControl('', {
      validators: [Validators.required]
    }),
    message: new FormControl('', {
      validators: [Validators.required]
    })
  })

  private httpClient = inject(HttpClient)
  private snackbarService = inject(SnackbarService)
  errorMessage:string="";

  onSubmit() {
    if(this.form.valid) {
      this.httpClient.post('http://localhost:3000/contact', {
        name: this.form.value.name,
        email: this.form.value.email,
        subject: this.form.value.subject,
        message: this.form.value.message
      }).subscribe({
        next: (res) => {
          this.form.reset()
          this.snackbarService.show("Sikeres küldés!")
          this.errorMessage=""
        },
        error: (err) => {
          this.snackbarService.show("Próbálja újra később!", "danger")
          this.errorMessage = "Hiba a küldés közben!"
        }
      })
    } else {
      this.errorMessage = "Töltse ki az összes mezőt!"
    }
  }
}
