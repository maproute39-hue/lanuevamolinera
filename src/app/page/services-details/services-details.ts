import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import PocketBase from 'pocketbase';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-services-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services-details.html',
  styleUrl: './services-details.scss',
})
export class ServicesDetails implements OnInit, OnDestroy {
    pb = new PocketBase('https://db.buckapi.site:8091');

  servicio: any = null;
  loading = true;
  error = false;

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.loadServicio(id);
    });
  }

  async loadServicio(id: string | null): Promise<void> {
    this.loading = true;
    this.error = false;
    this.servicio = null;
    this.cdr.detectChanges();

    if (!id) {
      this.error = true;
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      console.log('Cargando servicio con id:', id);

      const record = await this.pb.collection('servicios_molinera').getOne(id);

      console.log('Servicio cargado correctamente:', record);

      this.servicio = record;
    } catch (err) {
      console.error('Error cargando detalle del servicio:', err);
      this.error = true;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  getCoverImage(): string {
    if (!this.servicio) return 'assets/img/default-service.jpg';

    const fileName = this.servicio.cover_image || this.servicio.gallery?.[0];
    if (!fileName) return 'assets/img/default-service.jpg';

    return `https://db.buckapi.site:8091/api/files/servicios_molinera/${this.servicio.id}/${fileName}`;
  }

  getGalleryImages(): string[] {
    if (!this.servicio?.gallery?.length) return [];

    return this.servicio.gallery.map(
      (fileName: string) =>
        `https://db.buckapi.site:8091/api/files/servicios_molinera/${this.servicio.id}/${fileName}`
    );
  }

  getIncludesList(): string[] {
    if (!this.servicio?.includes) return [];
    return this.parseTextToList(this.servicio.includes);
  }

  getNotIncludesList(): string[] {
    if (!this.servicio?.not_includes) return [];
    return this.parseTextToList(this.servicio.not_includes);
  }

  getTagsList(): string[] {
    if (!this.servicio?.tags) return [];
    return this.servicio.tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => !!tag);
  }

  parseTextToList(value: string): string[] {
    return value
      .split(/\r?\n|,|•/)
      .map(item => item.trim())
      .filter(item => !!item);
  }

  formatPrice(value: number): string {
    if (value === null || value === undefined) return 'Consultar';
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  goBack(): void {
    this.router.navigate(['/services']);
  }
}
