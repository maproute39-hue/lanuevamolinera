import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-homedash',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './homedash.html',
  styleUrl: './homedash.scss',
})
export class Homedash implements OnInit, OnDestroy {
  adminName = 'Administrador';
  showDashboardContent = true;

  totalHabitaciones = 0;
  totalPlatos = 15;
  totalServicios = 6;

  loadingHabitaciones = false;

  private sub?: Subscription;
  private loadingSub?: Subscription;

  constructor(
    private router: Router,
    private habitacionesService: RealtimeHabitacionesService
  ) {}

 
  ngOnInit(): void {
  this.loadingSub = this.habitacionesService.isLoading$.subscribe(value => {
    this.loadingHabitaciones = value;
  });

  this.sub = this.habitacionesService.habitaciones$.subscribe(habitaciones => {
    this.totalHabitaciones = habitaciones.length;
  });

  this.cargarHabitaciones();

  // 👇 DETECTAR RUTA ACTIVA
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      const url = this.router.url;

      // Mostrar solo en /admin
      this.showDashboardContent = url === '/admin';
    });
}

  async cargarHabitaciones(): Promise<void> {
    try {
      await this.habitacionesService.loadHabitaciones();
    } catch (error) {
      console.error('Error cargando habitaciones en dashboard:', error);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.loadingSub?.unsubscribe();
  }

  logout(): void {
    localStorage.removeItem('adminSession');
    this.router.navigate(['/home']);
  }

  goToMenu(): void {
    this.router.navigate(['/admin/menu']);
  }

  goToRooms(): void {
    this.router.navigate(['/admin/habitaciones']);
  }

  goToServices(): void {
    this.router.navigate(['/admin/servicios']);
  }
}