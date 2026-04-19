import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Plato } from '../../models/plato.model';
import { RealtimeMenuService } from '../../services/menu-realtime.service';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menucomponent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menucomponent.html',
  styleUrl: './menucomponent.scss',
})
export class Menucomponent implements OnInit, OnDestroy {
  platos: Plato[] = [];
  loading = true;

  private platosSub?: Subscription;
  private loadingSub?: Subscription;

  constructor(
    public router: Router,
    public realtimeMenuService: RealtimeMenuService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadingSub = this.realtimeMenuService.isLoading$.subscribe(value => {
      this.zone.run(() => {
        this.loading = value;
        this.cdr.detectChanges();
      });
    });

    this.platosSub = this.realtimeMenuService.platos$.subscribe(data => {
      this.zone.run(() => {
        this.platos = [...data];
        this.cdr.detectChanges();
      });
    });

    this.loadPlatos();
  }

  async loadPlatos(): Promise<void> {
    try {
      await this.realtimeMenuService.loadPlatos();

      this.zone.run(() => {
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error cargando platos:', error);

      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los platos.'
      });
    }
  }

  goToAdd(): void {
    this.router.navigate(['/admin/agregar-plato']);
  }

  editPlato(id: string): void {
    this.router.navigate(['/admin/agregar-plato'], {
      queryParams: { id }
    });
  }

  async deletePlato(id: string, name: string): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar plato?',
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
      await this.realtimeMenuService.deletePlato(id);

      this.zone.run(() => {
        this.cdr.detectChanges();
      });

      Swal.fire({
        icon: 'success',
        title: 'Plato eliminado',
        text: 'El plato fue eliminado correctamente.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando plato:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el plato.'
      });
    }
  }

  getCoverUrl(plato: Plato): string {
    if (!plato.cover_image) {
      return 'assets/img/gallery/gallery_1_1.jpg';
    }

    return `https://db.buckapi.site:8091/api/files/menu_molinera/${plato.id}/${plato.cover_image}`;
  }

  trackByPlato(index: number, plato: Plato): string {
    return plato.id;
  }

  ngOnDestroy(): void {
    this.platosSub?.unsubscribe();
    this.loadingSub?.unsubscribe();
  }
}
