import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RealtimeServiciosService } from '../../services/servicios-realtime.service';
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
  totalPlatos = 0;
  totalServicios = 0;

  loadingHabitaciones = false;
  loadingPlatos = false;
  loadingServicios = false;

  private habitacionesSub?: Subscription;
  private habitacionesLoadingSub?: Subscription;
  private serviciosSub?: Subscription;
  private serviciosLoadingSub?: Subscription;
  private routerSub?: Subscription;

  constructor(
    private router: Router,
    private habitacionesService: RealtimeHabitacionesService,
    private serviciosService: RealtimeServiciosService
  ) {}

 
   ngOnInit(): void {
    this.habitacionesLoadingSub = this.habitacionesService.isLoading$.subscribe(value => {
      this.loadingHabitaciones = value;
    });

    this.habitacionesSub = this.habitacionesService.habitaciones$.subscribe(habitaciones => {
      this.totalHabitaciones = habitaciones.length;
    });

    this.serviciosLoadingSub = this.serviciosService.isLoading$.subscribe(value => {
      this.loadingServicios = value;
    });

    this.serviciosSub = this.serviciosService.servicios$.subscribe(servicios => {
      this.totalServicios = servicios.length;
    });

    this.cargarHabitaciones();
    this.cargarServicios();

    this.showDashboardContent = this.router.url === '/admin';

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showDashboardContent = this.router.url === '/admin';
      });
  }

  async cargarHabitaciones(): Promise<void> {
    try {
      await this.habitacionesService.loadHabitaciones();
    } catch (error) {
      console.error('Error cargando habitaciones en dashboard:', error);
    }
  }

  async cargarServicios(): Promise<void> {
    try {
      await this.serviciosService.loadServicios();
    } catch (error) {
      console.error('Error cargando servicios en dashboard:', error);
    }
  }

  ngOnDestroy(): void {
    this.habitacionesSub?.unsubscribe();
    this.habitacionesLoadingSub?.unsubscribe();
    this.serviciosSub?.unsubscribe();
    this.serviciosLoadingSub?.unsubscribe();
    this.routerSub?.unsubscribe();
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