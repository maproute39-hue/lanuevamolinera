import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { RealtimeServiciosService } from '../../services/servicios-realtime.service';
import { Servicio } from '../../models/servicio.model';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-servicescomponent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicescomponent.html',
  styleUrl: './servicescomponent.scss',
})
export class Servicescomponent implements OnInit, OnDestroy {
  servicios: Servicio[] = [];
  loading = true;

  private serviciosSub?: Subscription;
  private loadingSub?: Subscription;

  constructor(
    public router: Router,
    public realtimeServiciosService: RealtimeServiciosService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Servicios ngOnInit');

    this.loadingSub = this.realtimeServiciosService.isLoading$.subscribe(value => {
      this.zone.run(() => {
        console.log('loading$', value);
        this.loading = value;
        this.cdr.detectChanges();
      });
    });

    this.serviciosSub = this.realtimeServiciosService.servicios$.subscribe(data => {
      this.zone.run(() => {
        console.log('servicios$', data);
        this.servicios = [...data];
        this.cdr.detectChanges();
      });
    });

    this.loadServicios();
  }

  async loadServicios(): Promise<void> {
    try {
      await this.realtimeServiciosService.loadServicios();

      this.zone.run(() => {
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error cargando servicios:', error);

      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los servicios.'
      });
    }
  }

  goToAdd(): void {
    this.router.navigate(['/admin/agregar-servicio']);
  }

  editServicio(id: string): void {
    this.router.navigate(['/admin/agregar-servicio'], {
      queryParams: { id }
    });
  }

  async deleteServicio(id: string, name: string): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar servicio?',
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
      await this.realtimeServiciosService.deleteServicio(id);

      this.zone.run(() => {
        this.cdr.detectChanges();
      });

      Swal.fire({
        icon: 'success',
        title: 'Servicio eliminado',
        text: 'El servicio fue eliminado correctamente.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el servicio.'
      });
    }
  }

  getCoverUrl(servicio: Servicio): string {
    if (!servicio.cover_image) {
      return 'assets/img/gallery/gallery_1_1.jpg';
    }

    return `https://db.buckapi.site:8091/api/files/servicios_molinera/${servicio.id}/${servicio.cover_image}`;
  }

  trackByServicio(index: number, servicio: Servicio): string {
    return servicio.id;
  }

  ngOnDestroy(): void {
    this.serviciosSub?.unsubscribe();
    this.loadingSub?.unsubscribe();
  }
}