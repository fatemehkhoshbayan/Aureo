import { NotFound, PhotographerInfo, ServicesList } from '@/features';
import { MainLayout } from '@/layout';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ServicesList,
      },
      {
        path: 'photographer/:id',
        component: PhotographerInfo,
      },
      {
        path: '**',
        component: NotFound,
      },
    ],
  },
];
