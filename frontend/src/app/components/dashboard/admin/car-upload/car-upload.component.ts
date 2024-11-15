import { Component, DestroyRef, inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarsService } from '../../../../services/cars.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-car-upload',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './car-upload.component.html',
  styleUrl: './car-upload.component.scss'
})
export class CarUploadComponent implements OnInit {
  private destroyRef = inject(DestroyRef)
  private carsService = inject(CarsService)
  private adminService = inject(AdminService)
  private snackbarService = inject(SnackbarService)
  private router = inject(Router)

  cars:any;
  categories:any;
  submitErr=false
  errorText:string=""

  // PICTURE UPLOAD

  thumbnail: File | null = null;
  onBackFileSelected(event: any) {
    this.thumbnail = event.target.files[0] || null;
    if (this.thumbnail !== null) {
      console.log(this.thumbnail)
      this.previewImageBack(this.thumbnail);
    }
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

  // TODO: ADMIN PRIVILIGE ELLENŐRZÉSE!!!!
  
  // ADD FORM

  openAddDialog() {
    const dialog = document.getElementById("addExpenseDialog") as HTMLElement
    
    dialog.style.visibility = "unset"
  }

  hideAddDialog() {
    const dialog = document.getElementById("addExpenseDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
    this.submitErr=false
  }

  addCarForm = new FormGroup({
    brand: new FormControl('', { validators: Validators.required }),
    model: new FormControl('', { validators: Validators.required }),
    cc: new FormControl('', { validators: Validators.required }),
    year: new FormControl('', { validators: Validators.required }),
    licensePlate: new FormControl('', { validators: Validators.required }),
    category: new FormControl('', { validators: Validators.required }),
    pricePerDay: new FormControl('', { validators: Validators.required }),
    mileage: new FormControl('', { validators: Validators.required }),
    isDiesel: new FormControl(''),
    isManual: new FormControl(''),
    seats: new FormControl('', { validators: Validators.required }),
    doors: new FormControl('', { validators: Validators.required }),
    lastServiceDate: new FormControl('', { validators: Validators.required }),
    description: new FormControl(''),
    equipments: new FormControl(''),
  })

  convertIsDiesel() {
    if(this.addCarForm.value.isDiesel == "true") {
      return '0'
    } else {
      return '1'
    }
  }

  converIsManual() {
    if(this.addCarForm.value.isManual == "true") {
      return '0'
    } else {
      return '1'
    }
  }

  onAddCar() {
    if(this.addCarForm.invalid) {
      this.errorText="Tölts ki minden kötelező mezőt!"
      this.submitErr = true
      return
    }

    const formData = new FormData()
    formData.append('brand', this.addCarForm.value.brand!);
    formData.append('model', this.addCarForm.value.model!);
    formData.append('cc', this.addCarForm.value.cc!);
    formData.append('year', this.addCarForm.value.year!);
    formData.append('licensePlate', this.addCarForm.value.licensePlate!);
    formData.append('category', this.addCarForm.value.category!);
    formData.append('available', '1');
    formData.append('pricePerDay', this.addCarForm.value.pricePerDay!);
    formData.append('mileage', this.addCarForm.value.mileage!);
    formData.append('isDiesel', this.convertIsDiesel());
    formData.append('lastServiceDate', this.addCarForm.value.lastServiceDate!);
    formData.append('seats', this.addCarForm.value.seats!);
    formData.append('doors', this.addCarForm.value.doors!);
    formData.append('isManual', this.converIsManual());
    formData.append('thumbnail', this.thumbnail!),
    formData.append('description', this.addCarForm.value.description!),
    formData.append('equipments', this.addCarForm.value.equipments!)
    
    const subscription = this.adminService.addCar(formData).subscribe({
      next: (res) => {
        this.addCarForm.reset()
        this.hideAddDialog()
        this.snackbarService.show("Sikeres feltöltés!")
        this.errorText=""
      },
      error: (err) => {
        this.errorText="Hiba a feltöltés során! Ellenőrizze újból a megadott adatokat."
        this.submitErr=true
      }
    })
    this.destroyRef.onDestroy( () => subscription.unsubscribe() )
  }

  ngOnInit(): void {
    const subscription = this.carsService.getCarList().subscribe({
      next: (cars) => {
        this.cars=cars
      },
      error: (err) => {
        console.log("ERROR:" + err)
      }
    })

    const getCategories = this.carsService.getCategoryList().subscribe({
      next: (categories) => {
        this.categories=categories;
        console.log(categories)
      },
      error: (err) => {
        console.log("ERROR: " + err)
      }
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
      getCategories.unsubscribe()
    })

  }
}
