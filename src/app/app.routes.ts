import { Routes } from '@angular/router';
import { RoomDetails } from './page/room-details/room-details';
import { About } from './page/about/about';

export const routes: Routes = [

    {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./page/home/home').then(c => c.Home),
    title: 'La Nueva Molinera',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
  {
    path: 'room-details',
    loadComponent: () =>
      import('./page/room-details/room-details').then(c => c.RoomDetails),
    title: 'La Nueva Molinera',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./page/about/about').then(c => c.About),
    title: 'La Nueva Molinera',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
];
