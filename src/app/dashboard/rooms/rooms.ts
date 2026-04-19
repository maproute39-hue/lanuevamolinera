import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Habitacion } from '../../models/habitacion.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.scss',
})
export class Habitaciones implements OnInit, OnDestroy {
  habitaciones: Habitacion[] = [];
  loading = true;

  private habitacionesSub?: Subscription;
  private loadingSub?: Subscription;

  constructor(
    public router: Router,
    public realtimeHabitacionesService: RealtimeHabitacionesService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadingSub = this.realtimeHabitacionesService.isLoading$.subscribe(value => {
      this.loading = value;
    });

    this.habitacionesSub = this.realtimeHabitacionesService.habitaciones$.subscribe(data => {
      this.habitaciones = data;
      this.changeDetectorRef.detectChanges();
    });

    this.loadHabitaciones();
  }

  async loadHabitaciones(): Promise<void> {
    try {
      await this.realtimeHabitacionesService.loadHabitaciones();
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las habitaciones.'
      });
    }
  }

  goToAdd(): void {
    this.router.navigate(['/admin/agregar']);
  }

  editHabitacion(id: string): void {
    this.router.navigate(['/admin/agregar'], {
      queryParams: { id }
    });
  }

  viewHabitacion(id: string): void {
    this.router.navigate(['/room-details', id]);
  }

  async deleteHabitacion(id: string, name: string): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar habitación?',
      text: `Se eliminará "${name}" de forma permanente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b3261e',
      cancelButtonColor: '#6f7d26'
    });

    if (!result.isConfirmed) return;

    try {
      await this.realtimeHabitacionesService.deleteHabitacion(id);
      Swal.fire({
        icon: 'success',
        title: 'Habitación eliminada',
        text: 'La habitación fue eliminada correctamente.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando habitación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la habitación.'
      });
    }
  }

  getImageUrl(habitacion: Habitacion): string {
    if (!habitacion?.img || !habitacion.img.length) {
      return 'assets/img/gallery/gallery_1_1.jpg';
    }

    return `https://db.buckapi.site:8091/api/files/habitaciones_molinera/${habitacion.id}/${habitacion.img[0]}`;
  }

  trackByHabitacion(index: number, habitacion: Habitacion): string {
    return habitacion.id;
  }

  ngOnDestroy(): void {
    this.habitacionesSub?.unsubscribe();
    this.loadingSub?.unsubscribe();
  }
}
