import { MainLayout } from '@/layout';
import { Routes } from '@angular/router';
import { NotFound, Services } from './features';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Services,
      },
      {
        path: '**',
        component: NotFound,
      },
    ],
  },
];
