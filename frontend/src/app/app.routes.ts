import { MyBookings, MyProfile, NotFound, PhotographerInfo, ServicesList } from '@/features';
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
        path: 'my-bookings',
        component: MyBookings,
      },
      {
        path: 'my-profile',
        component: MyProfile,
      },
      {
        path: '**',
        component: NotFound,
      },
    ],
  },
];
