
export interface PhoneCountryFiltered {
  name: string;        // "India"
  iso2: string;        // "IN"
  dialCode: string;    // "+91"
  flag: string;     // SVG flag URL
}

export interface PhoneCountry {
  cca2: string;   // ISO2 code (e.g., "SY")

  name: {
    common: string;     // "Syria"
    official: string;   // "Syrian Arab Republic"
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };

  flags: {
    png: string;
    svg: string;
    alt?: string;
  };

  idd: {
    root: string;        // "+9"
    suffixes: string[];  // ["63"]
  };
}