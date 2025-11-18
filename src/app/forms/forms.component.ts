import { Component, inject, Inject } from '@angular/core';
import { PhoneNumberComponent } from '../../phone-number/phone-number.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-forms',
  imports: [PhoneNumberComponent,ReactiveFormsModule],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.css'
})
export class FormsComponent {
  form!: FormGroup
  formBuilder = inject(FormBuilder)
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      phoneControl: [''],
      countryControl: ['']
    })
  }
  get phoneControl(): FormControl {
    return this.form.get('phoneControl') as FormControl;
  }
  get countryCodeControl(): FormControl {
    return this.form.get('countryControl') as FormControl;
  }
}
