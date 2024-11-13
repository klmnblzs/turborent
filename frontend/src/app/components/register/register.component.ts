import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private snackbarService = inject(SnackbarService)

  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
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
    licensePictureFront: new FormControl('', { validators: [Validators.required] }),
    licensePictureBack: new FormControl('', { validators: [Validators.required] }),
  })
  
  imageUrlFront: string | null = null;
  imageUrlBack: string | null = null;

  onFrontFileSelected(event: any) {
    this.licenseFrontFile = event.target.files[0] || null;

    if (this.licenseFrontFile !== null) {
      console.log(this.licenseFrontFile);
      this.previewImageFront(this.licenseFrontFile);
    }
  }

  onBackFileSelected(event: any) {
    this.licenseBackFile = event.target.files[0] || null;
    if (this.licenseBackFile !== null) {
      console.log(this.licenseBackFile)
      this.previewImageBack(this.licenseBackFile);
    }

  }

  previewImageFront(file: File): void {
    const imgArea = document.querySelector('#img-area-front') as HTMLElement;
    const reader = new FileReader();

    reader.onload = () => {
      const allImg = imgArea.querySelectorAll('img');
      allImg.forEach(item => item.remove());

      const imgUrl = reader.result as string; 
      const img = document.createElement('img');
			img.src = imgUrl;
			imgArea.appendChild(img);
			imgArea.classList.add('active');      
    };

    reader.readAsDataURL(file);
  }

  previewImageBack(file: File): void {
    const imgArea = document.querySelector('#img-area-back') as HTMLElement;
    const reader = new FileReader();

    reader.onload = () => {
      const allImg = imgArea.querySelectorAll('img');
      allImg.forEach(item => item.remove());
      const imgUrl = reader.result as string; 
      const img = document.createElement('img');
			img.src = imgUrl;
			imgArea.appendChild(img);
			imgArea.classList.add('active');
    };

    reader.readAsDataURL(file);
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

  registerError=false;
  errorText:string=""

  onSubmit() {
    const formData = new FormData();
    formData.append('first_name', this.form.get('firstname')?.value!);
    formData.append('last_name', this.form.get('lastname')?.value!);
    formData.append('email', this.form.get('email')?.value!);
    formData.append('phone_number', this.form.get('phone')?.value!);
    formData.append('date_of_birth', this.form.get('dateofbirth')?.value!);
    formData.append('post_code', this.form.get('postcode')?.value!);
    formData.append('city', this.form.get('city')?.value!);
    formData.append('street', this.form.get('address')?.value!);
    formData.append('house_number', this.form.get('housenum')?.value!);
    formData.append('password', this.form.get('password')?.value!);
    formData.append('licensePictureFront', this.licenseFrontFile!);
    formData.append('licensePictureBack', this.licenseBackFile!);

    this.authService.checkDuplicate(this.form.get('email')?.value!).subscribe({
      next: (res: any) => {
        const subscription = this.authService.registerUser(formData).subscribe({
          next: (res: any) => {
            setTimeout(() => {
              this.router.navigate(["/login"]);
              this.registerError = false
              this.errorText=""
              this.snackbarService.show("Sikeres regisztráció!")
            });
          },
          error: (err) => {
            this.registerError = true;
            this.errorText = 'Tölts ki minden mezőt!';
          }
        });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
      },
      error: (err) => {
        this.registerError = true;
        this.errorText = 'Ezt a felhasználót már regisztrálták!';
      }
    })
  }
}