import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PhoneNumberComponent } from '../phone-number/phone-number.component';
import { FormsComponent } from './forms/forms.component';

@Component({
  selector: 'app-root',
  imports: [FormsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'country-code-with-phone';
}
