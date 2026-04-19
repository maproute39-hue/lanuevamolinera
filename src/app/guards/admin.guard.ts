import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const isLogged = localStorage.getItem('adminSession');
  return isLogged === 'true';
};