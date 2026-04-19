import { Routes } from '@angular/router';
import { RoomDetails } from './page/room-details/room-details';
import { About } from './page/about/about';
import { Add } from './dashboard/add/add';
import { Contact } from './page/contact/contact';
import { Rooms } from './page/rooms/rooms';
import { Services } from './page/services/services';
import { Servicescomponent } from './dashboard/servicescomponent/servicescomponent';
import { Menucomponent } from './dashboard/menucomponent/menucomponent';
import { Homedash } from './dashboard/homedash/homedash';
import { adminGuard } from './guards/admin.guard';
import { Habitaciones } from './dashboard/rooms/rooms';
import { AddService } from './dashboard/add-service/add-service';
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
      description: 'La Nueva Molinera',
      canonical: '/',
    },
  },
  {
    path: 'room-details/:id',
    loadComponent: () =>
      import('./page/room-details/room-details').then(c => c.RoomDetails),
    title: 'Detalle de la habitación',
    data: {
      description: 'La Nueva Molinera',
      canonical: '/',
    },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./page/about/about').then(c => c.About),
    title: 'Quiénes Somos',
    data: {
      description: 'La Nueva Molinera',
      canonical: '/',
    },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./page/contact/contact').then(c => c.Contact),
    title: 'Contacto',
    data: {
      description: 'La Nueva Molinera',
      canonical: '/',
    },
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./dashboard/homedash/homedash').then(c => c.Homedash),
    canActivate: [adminGuard],
    children: [
      {
        path: 'menu',
        loadComponent: () =>
          import('./dashboard/menucomponent/menucomponent').then(c => c.Menucomponent),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./dashboard/servicescomponent/servicescomponent').then(c => c.Servicescomponent),
      },
      {
        path: 'agregar-servicio',
        loadComponent: () =>
          import('./dashboard/add-service/add-service').then(c => c.AddService),
      },
      
      {
        path: 'agregar',
        loadComponent: () =>
          import('./dashboard/add/add').then(c => c.Add),
      },
      {
        path: 'habitaciones',
        loadComponent: () =>
          import('./dashboard/rooms/rooms').then(c => c.Habitaciones),
        canActivate: [adminGuard],
        title: 'Administrar habitaciones'
      },
    ]
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./page/rooms/rooms').then(c => c.Rooms),
    title: 'Habitaciones',
    data: {
      description: 'La Nueva Molinera',
      canonical: '/',
    },
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./page/services/services').then(c => c.Services),
    title: 'Servicios',
    data: {
      description: 'La Nueva Molinera',
      canonical: '/',
    },
  },
];
