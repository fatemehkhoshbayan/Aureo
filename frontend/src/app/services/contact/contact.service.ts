import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environment';
import { ContactMessage } from './contact.interfaces';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  send(payload: ContactMessage) {
    return this.http.post<void>(`${environment.apiBase}/contact`, payload);
  }
}
