import {
  BecomePhotographer,
  BookingForm,
  MyBookings,
  MyProfile,
  NotFound,
  PhotographerDashboard,
  PhotographerInfo,
  ServicesList,
} from '@/features';
import { MainLayout } from '@/layout';
import { authGuard, roleGuard } from '@/services';
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
        path: 'photographer/dashboard',
        component: PhotographerDashboard,
        canActivate: [authGuard, roleGuard('photographer', 'admin')],
      },
      {
        path: 'photographer/:id',
        component: PhotographerInfo,
      },
      {
        path: 'book/:id',
        component: BookingForm,
        canActivate: [authGuard],
      },
      {
        path: 'my-bookings',
        component: MyBookings,
        canActivate: [authGuard],
      },
      {
        path: 'my-profile',
        component: MyProfile,
      },
      {
        path: 'become-a-photographer',
        component: BecomePhotographer,
      },
      {
        path: '**',
        component: NotFound,
      },
    ],
  },
];
