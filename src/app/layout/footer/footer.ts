import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FOOTER_LINKS } from './constants';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styles: ``,
})
export class Footer {
  protected readonly FOOTER_LINKS = FOOTER_LINKS;
}
