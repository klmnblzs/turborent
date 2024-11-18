import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecurityComponent {
  securityForm = new FormGroup({
    oldpassword: new FormControl(''),
    newpassword: new FormControl('')
  })
}
