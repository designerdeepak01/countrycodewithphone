import { Component, inject, Input, input, OnChanges } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormControl } from '@angular/forms';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
import { PhoneCountry, PhoneCountryFiltered } from '../../models/auth.model';
import { KycStorageService } from '../../services/kyc-storage.service';
import { ToastrService } from 'ngx-toastr';
import { parsePhoneNumberFromString } from "libphonenumber-js";

@Component({
  selector: 'app-phone-number',
  imports: [SharedModuleModule],
  templateUrl: './phone-number.component.html',
  styleUrl: './phone-number.component.css'
})
export class PhoneNumberComponentcopy implements OnChanges {
  authService = inject(AuthService);
  KYCService = inject(KycStorageService);
  toster = inject(ToastrService);

  @Input() controlName!: FormControl;
  @Input() countryControl!: FormControl;
  countries: PhoneCountryFiltered[] = [];
  filtedCountry: PhoneCountryFiltered[] = [];
  searchText: string = '';
  countriesOpen: boolean = false;
  selectedCountry!: PhoneCountryFiltered | undefined;
  displayNumber: string = '';
  async ngOnInit() {
    this.getAllCountries();
  
    // if (this.countryControl.value) {
    //   console.log(this.controlName);

    //   await 

    // }
    //   const val = this.controlName.value;

    // if (val && val.number) {
    //   console.log(val);

    //   this.displayNumber = val.number;
    //   console.log('Dee',this.displayNumber);

    // }
  }
  ngOnChanges() {
    if (this.controlName && this.controlName.value) {
      const val = this.controlName.value;
      console.log('Deepak', val);
      this.displayNumber = val.number;
      if (val && val.number) {
        console.log('Deeo', this.displayNumber);

      }

    }

    if (this.controlName) {

      this.listenToValueChanges();
    }
    //   if (this.countryControl) {

    //   this.listenTocountryControl();
    // }
  }
//    listenTocountryControl() {
//   this.countryControl.valueChanges.subscribe(val => {
//     if (!val) return;

//     this.countryControl.setValue(val, { emitEvent: false });
//     this.selectedValue(val);
//   });
// }

  listenToValueChanges() {
    this.controlName.valueChanges.subscribe(val => {
      if (!val) return;

      // if value is an object → show formatted number
      if (val.number) {
        this.displayNumber = val.number;
      }

      // if value is string → ignore or convert
    });
  }

  async getAllCountries() {
    this.KYCService.getCountries().then((storedCountries) => {
      if (storedCountries && Array.isArray(storedCountries)) {
        this.countries = storedCountries;
        this.filtedCountry = this.countries.sort((a, b) => a.name.localeCompare(b.name));
        if(this.countryControl.value){
          this.selectedValue(this.countryControl.value);
        }
      } else {
        this.toster.warning('Fetching country data from server...');
      }

    })
  }
  selectCountry(countryCode: any) {
    this.searchText = '';
    this.displayNumber = '';
    this.countriesOpen = false,
      this.filtedCountry = this.countries
    this.selectedValue(countryCode.iso2)
  }


  //   {
  //     "number": "78965 84125",
  //     "internationalNumber": "+91 78965 84125",
  //     "nationalNumber": "078965 84125",
  //     "e164Number": "+917896584125",
  //     "countryCode": "IN",
  //     "dialCode": "+91"
  // }

  selectedValue(countryCode: any) {

    if (this.countries) {
      this.selectedCountry = this.countries.find(country => country.iso2.toLowerCase().includes(countryCode.toLowerCase())
      );
      this.countryControl.setValue(this.selectedCountry?.iso2);
    }

  }


  openiSOList() {
    this.countriesOpen = !this.countriesOpen
  }
  searchValue(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtedCountry = this.countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm)
    );
    console.log(this.filtedCountry);

  }
  updateNumber(event: Event) {
    const inputNumber = (event.target as HTMLInputElement).value;

    if (!this.selectedCountry) return;

    const formatted = this.formatPhone(inputNumber, this.selectedCountry.iso2);

    if (formatted) {
      // valid → store object
      this.controlName.setValue(formatted);
      this.displayNumber = formatted.number;
    } else {
      // invalid → store null
      this.controlName.setValue(inputNumber);
      this.displayNumber = inputNumber;
    }

    this.controlName.markAsTouched();
    this.controlName.updateValueAndValidity();
  }

  formatPhone(phone: string, country: string) {
    const phoneNumber = parsePhoneNumberFromString(phone, country as any);

    if (!phoneNumber || !phoneNumber.isValid()) {
      return null;
    }

    return {
      number: phoneNumber.formatNational().replace('0', ""),
      internationalNumber: phoneNumber.formatInternational(),
      nationalNumber: phoneNumber.formatNational(),
      e164Number: phoneNumber.number, // already e164
      countryCode: phoneNumber.country,
      dialCode: "+" + phoneNumber.countryCallingCode
    };
  }
}
