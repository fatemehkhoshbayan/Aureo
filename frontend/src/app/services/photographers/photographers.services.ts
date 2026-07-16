// services/photographers.service.ts
import { Injectable, signal } from '@angular/core';
import { PHOTOGRAPHERS } from '../../features/service-list/components/constants';
import { Photographer } from './photographers.interfaces';

@Injectable({ providedIn: 'root' })
export class PhotographersService {
  private readonly photographers = signal<Photographer[]>(PHOTOGRAPHERS);

  getAll() {
    return this.photographers();
  }

  getById(id: string): Photographer | undefined {
    return this.photographers().find((p) => p.id === id);
  }
}
