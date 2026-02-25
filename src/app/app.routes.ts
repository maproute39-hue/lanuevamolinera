import { Routes } from '@angular/router';
import { RoomDetails } from './page/room-details/room-details';
import { About } from './page/about/about';
import { Add } from './dashboard/add/add';
import { Contact } from './page/contact/contact';
import { Rooms } from './page/rooms/rooms';
import { Services } from './page/services/services';
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
    path: 'room-details/:id',
    loadComponent: () =>
      import('./page/room-details/room-details').then(c => c.RoomDetails),
    title: 'Detalle de la habitacion',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./page/about/about').then(c => c.About),
    title: 'Quienes Somos',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./page/contact/contact').then(c => c.Contact),
    title: 'Contacto',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./dashboard/add/add').then(c => c.Add),
    title: 'La Nueva Molinera',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./page/rooms/rooms').then(c => c.Rooms),
    title: 'Habitaciones',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./page/services/services').then(c => c.Services),
    title: 'Servicios',
    data: {
      description: 'La Nueva Molinera ',
      canonical: '/',
    },
  },
];
