import { Component, Input, OnInit, OnDestroy, inject, HostListener, ElementRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Subject, takeUntil, filter, firstValueFrom } from 'rxjs';
import { PhoneCountryFiltered } from '../app/models/phone.model';
import { CommonService } from '../app/service/common.service';
import { CommonModule, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-phone-number',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgIf, NgClass],
  templateUrl: './phone-number.component.html',
  styleUrl: './phone-number.component.css'
})
export class PhoneNumberComponent implements OnInit, OnDestroy {

  @Input() controlName!: FormControl;
  @Input() countryControl!: FormControl;

  countries: PhoneCountryFiltered[] = [];
  filtedCountry: PhoneCountryFiltered[] = [];
  authService = inject(CommonService);
  private eRef =  inject(ElementRef);
  searchText: string = '';
  countriesOpen = false;
  selectedCountry!: PhoneCountryFiltered | undefined;
  displayNumber = '';

  private destroy$ = new Subject<void>();
@HostListener('document:click', ['$event'])
handleOutsideClick(event: Event) {
  if (!this.eRef.nativeElement.contains(event.target)) {
    this.countriesOpen = false;  // CLOSE DROPDOWN
    this.searchText = '';
    this.filtedCountry = [...this.countries];
  }
}
  // ------------------------------------------
  // INIT
  // ------------------------------------------
  ngOnInit() {
    this.loadCountries();
    this.listenToFormValueChanges();
     this.listenToCountryChanges()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  // ------------------------------------------
  // LOAD COUNTRIES
  // ------------------------------------------
  async loadCountries() {
    const storedCountries = await this.getAllCountries();

    if (!storedCountries) return;

    this.countries = storedCountries?.sort((a, b) => a.name.localeCompare(b.name));
    this.filtedCountry = [...this.countries];

    // Patch selected country
    const selected = this.countryControl.value;
    if (selected) this.setSelectedCountry(selected);

    // Patch phone display if object exists
    const phoneVal = this.controlName.value;
    if (phoneVal?.number) {
      this.displayNumber = phoneVal.number;
    }
  }
     async getAllCountries(): Promise<PhoneCountryFiltered[] | undefined> {
      try {
        const response = await firstValueFrom(this.authService.getAllCountries());
        return response;
      } catch {
        return undefined;
      }
    }


  // ------------------------------------------
  // LISTEN TO PHONE CONTROL CHANGES
  // ------------------------------------------
  listenToFormValueChanges() {
    this.controlName.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter(v => !!v)
      )
      .subscribe(val => {
        if (val?.number) {
          this.displayNumber = val.number;
        }
      });
  }
  listenToCountryChanges() {
  this.countryControl.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(code => {
      if (!code) return;
      this.setSelectedCountry(code);
    });
}


  // ------------------------------------------
  // SELECT COUNTRY
  // ------------------------------------------
  setSelectedCountry(code: string) {

    this.selectedCountry = this.countries.find(
      c => c.iso2.toLowerCase() === code.toLowerCase()
    );

    // Avoid infinite loop
    this.countryControl.setValue(code, { emitEvent: false });
  }


  selectCountry(country: PhoneCountryFiltered) {
    this.countriesOpen = false;
    this.searchText = '';

    this.setSelectedCountry(country.iso2);

    // reset display number when user changes country
    this.displayNumber = '';
    this.controlName.setValue(null);
  }


  // ------------------------------------------
  // SEARCH COUNTRY
  // ------------------------------------------
  searchValue(event: Event) {
    // let text = (event.target as HTMLInputElement).value.toLowerCase();
    let text = this.searchText || '';
    // 1️⃣ Remove numbers
    text = text.replace(/[0-9]/g, '');
    
    // 2️⃣ Trim start & end space
    text = text.trim();
    
    // 3️⃣ Allow only one space between text
    text = text.replace(/\s+/g, ' ');
    
    // this.searchText = text
    this.filtedCountry = this.countries.filter(c =>
      c.name.toLowerCase().includes(text)
    );
  }


  // ------------------------------------------
  // UPDATE PHONE INPUT
  // ------------------------------------------
  updateNumber(event: Event) {
    const input = (event.target as HTMLInputElement).value;

    if (!this.selectedCountry) return;

    const formatted = this.formatPhone(input, this.selectedCountry.iso2);

    if (formatted) {
      this.controlName.setValue(formatted, { emitEvent: false });
      this.displayNumber = formatted.number;
    } else {
      this.controlName.setValue(input, { emitEvent: false });
      this.displayNumber = input;
    }

    this.controlName.markAsTouched();
    this.controlName.updateValueAndValidity();
    
  }


  // ------------------------------------------
  // PHONE FORMAT
  // ------------------------------------------
  formatPhone(phone: string, countryCode: string) {
    const phoneNumber = parsePhoneNumberFromString(phone, countryCode as any);

    if (!phoneNumber || !phoneNumber.isValid()) return null;

    return {
      number: phoneNumber.formatNational().replace(/^0/, ''),
      internationalNumber: phoneNumber.formatInternational(),
      nationalNumber: phoneNumber.formatNational(),
      e164Number: phoneNumber.number,
      countryCode: phoneNumber.country,
      dialCode: "+" + phoneNumber.countryCallingCode
    };
  }


  // ------------------------------------------
  // UI TOGGLE
  // ------------------------------------------
  openiSOList() {
    this.countriesOpen = !this.countriesOpen;
  }
}