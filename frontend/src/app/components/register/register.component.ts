import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private customersService = inject(CustomersService);
  private router = inject(Router);
  
  licenseFrontFile: File | null = null;
  licenseBackFile: File | null = null;

  form = new FormGroup({
    firstname: new FormControl('', { validators: [Validators.required] }),
    lastname: new FormControl('', { validators: [Validators.required] }),
    email: new FormControl('', { validators: [Validators.email, Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)] }),
    phone: new FormControl('', { validators: [Validators.required] }),
    city: new FormControl('', { validators: [Validators.required] }),
    postcode: new FormControl('', { validators: [Validators.required] }),
    address: new FormControl('', { validators: [Validators.required] }),
    housenum: new FormControl('', { validators: [Validators.required] }),
    dateofbirth: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)] }),
    passwordConfirm: new FormControl('', { validators: [Validators.required] }),
    licensePictureFront: new FormControl('', { validators: [Validators.required], }),
    licensePictureBack: new FormControl('', { validators: [Validators.required]}),
  })

  onFrontFileSelected(event: any) {
    this.licenseFrontFile = event.target.files[0] || null;
  }

  onBackFileSelected(event: any) {
    this.licenseBackFile = event.target.files[0] || null;
  }

  hasUpperCase(str: string | null) {
    return str ? /[A-Z]/.test(str) : false;
  }

  hasNumber(str: string | null) {
    return str ? /\d/.test(str) : false;
  }

  hasSpecialCharacter(str:string | null) {
    return str ? /[!@#$%^&*]/.test(str) : false
  }

  registerCustomer(formData: FormData) {
    return this.customersService.postRequest(
      "http://localhost:3000/customers/register", 
      formData, 
      "Could not register customer"
    );
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('first_name', this.form.get('firstname')?.value!); // Non-null assertion
    formData.append('last_name', this.form.get('lastname')?.value!); // Non-null assertion
    formData.append('email', this.form.get('email')?.value!); // Non-null assertion
    formData.append('phone_number', this.form.get('phone')?.value!); // Non-null assertion
    formData.append('date_of_birth', this.form.get('dateofbirth')?.value!); // Non-null assertion
    formData.append('post_code', this.form.get('postcode')?.value!); // Non-null assertion
    formData.append('city', this.form.get('city')?.value!); // Non-null assertion
    formData.append('street', this.form.get('address')?.value!); // Non-null assertion
    formData.append('house_number', this.form.get('housenum')?.value!); // Non-null assertion
    formData.append('password', this.form.get('password')?.value!); // Non-null assertion
    formData.append('licensePictureFront', this.licenseFrontFile!); // Non-null assertion
    formData.append('licensePictureBack', this.licenseBackFile!); // Non-null assertion

    const subscription = this.registerCustomer(formData).subscribe({
      next: (res) => {
        this.router.navigate(["/cars"]);
        this.form.reset()
      }
     })
     
     this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe()
     })
  }
}