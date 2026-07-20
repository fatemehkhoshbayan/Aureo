import { Photographer } from '@/services';
import { mediaUrl } from '@/utils';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-photographer-info',
  imports: [],
  templateUrl: './photographer-info.html',
  styles: ``,
})
export class PhotographerInfo {
  protected readonly mediaUrl = mediaUrl;
  photographer = input.required<Photographer>();
}
