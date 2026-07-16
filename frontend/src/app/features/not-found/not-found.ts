import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  host: {
    class:
      'flex flex-1 flex-col items-center justify-center w-full min-h-0 px-4 sm:px-6 lg:px-8 py-8',
  },
  styles: ``,
})
export class NotFound {}
