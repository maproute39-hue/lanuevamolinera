import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.scss',
})
export class Rooms implements OnInit, OnDestroy {
  habitaciones: any[] = [];
  habitacionesFiltradas: any[] = [];

  checkin: string = '';
  checkout: string = '';
  personas: number | null = null;
  precioMin: number | null = null;
  precioMax: number | null = null;
  tipoHabitacion: string = '';

  private sub = new Subscription();

  constructor(
    public RealtimeHabitacionesService: RealtimeHabitacionesService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Suscribirse a las habitaciones
    this.sub.add(
      this.RealtimeHabitacionesService.habitaciones$.subscribe((data) => {
        this.habitaciones = data;
        this.aplicarFiltros();
      })
    );

    // Leer parámetros de búsqueda de la URL
    this.sub.add(
      this.route.queryParams.subscribe(params => {
        this.checkin = params['checkin'] || '';
        this.checkout = params['checkout'] || '';
        this.personas = params['personas'] ? Number(params['personas']) : null;
        this.precioMin = params['precioMin'] ? Number(params['precioMin']) : null;
        this.precioMax = params['precioMax'] ? Number(params['precioMax']) : null;
        this.tipoHabitacion = params['tipoHabitacion'] || '';

        console.log('Filtros aplicados:', {
          checkin: this.checkin,
          checkout: this.checkout,
          personas: this.personas,
          precioMin: this.precioMin,
          precioMax: this.precioMax,
          tipoHabitacion: this.tipoHabitacion
        });

        this.aplicarFiltros();
      })
    );

    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  viewHabitacion(id: string) {
    this.router.navigate(['/room-details', id]);
  }

  aplicarFiltros(): void {
    this.habitacionesFiltradas = this.habitaciones.filter((habitacion: any) => {
      // Filtro por capacidad
      if (this.personas && habitacion.ability < this.personas) {
        return false;
      }

      // Filtro por precio máximo
      if (this.precioMax && habitacion.price_cop > this.precioMax) {
        return false;
      }

      // Filtro por precio mínimo
      if (this.precioMin && habitacion.price_cop < this.precioMin) {
        return false;
      }

      // Filtro por tipo de habitación (si se implementa en el futuro)
      if (this.tipoHabitacion && habitacion.type !== this.tipoHabitacion) {
        return false;
      }

      // Verificar disponibilidad
      const disponible = habitacion.available !== false;
      if (!disponible) {
        return false;
      }

      return true;
    });

    console.log(`Mostrando ${this.habitacionesFiltradas.length} de ${this.habitaciones.length} habitaciones`);
  }
}
