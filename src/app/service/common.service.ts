import { inject, Injectable } from '@angular/core';
import { PhoneCountry, PhoneCountryFiltered } from '../models/phone.model';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  httpClient = inject(HttpClient)
  constructor() { }
    getAllCountries(): Observable<PhoneCountryFiltered[]> {
    const url = 'https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags'
    return this.httpClient.get<PhoneCountry[]>(url).pipe(
      map((countries: PhoneCountry[]) => {
        
        const updated = countries.map(c => {

          let dialCode = c.idd.root;

          // If only one suffix, combine (e.g., India)
          if (c.idd.suffixes.length === 1) {
            dialCode = c.idd.root + c.idd.suffixes[0];  // "+9" + "1" = "+91"
          }
          const filtedData = {
            flag: c.flags.svg === 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_the_Taliban.svg' ? 'https://flagcdn.com/af.svg': c.flags.svg,
            iso2: c.cca2,
            name: c.name.common,
            dialCode: dialCode,
          }
          return filtedData;
        })
        return updated
      })
    )
  }
}
