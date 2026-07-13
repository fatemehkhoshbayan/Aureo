import { Component } from '@angular/core';
import { CategoryFilter, HeroSection, ServicesList, Sidebar } from './components';

@Component({
  selector: 'app-services',
  imports: [HeroSection, Sidebar, ServicesList, CategoryFilter],
  templateUrl: './services.html',
  styles: ``,
})
export class Services {}
