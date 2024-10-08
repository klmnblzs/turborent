import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule],
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

  onSubmit() {
    console.log(this.form);
  }
}
