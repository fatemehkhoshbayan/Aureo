import { Component, input, model } from '@angular/core';

export interface TabItem {
  key: string;
  label?: string;
  count?: number;
}

@Component({
  selector: 'app-tabs',
  imports: [],
  templateUrl: './tabs.html',
})
export class Tabs {
  tabs = input.required<TabItem[]>();
  activeColor = input<string>('#934761');
  activeTab = model<string>('');

  selectTab(key: string): void {
    if (key === this.activeTab()) return;
    this.activeTab.set(key);
  }
}
