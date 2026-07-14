import { Component } from '@angular/core';
import { CategoryFilter, HeroSection, ServicesList } from './components';

@Component({
  selector: 'app-services',
  imports: [HeroSection, ServicesList, CategoryFilter],
  templateUrl: './services.html',
  styles: ``,
})
export class Services {}
