import { Component, OnDestroy, OnInit } from '@angular/core';
import { RealtimeServiciosService } from '../../services/servicios-realtime.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements OnInit, OnDestroy {
  servicios$!: Observable<any[]>;
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];

  tipoEvento: string = '';
  personas: number | null = null;
  precioMax: number | null = null;

  private sub = new Subscription();

  constructor(
    public realtimeServiciosService: RealtimeServiciosService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.servicios$ = this.realtimeServiciosService.servicios$;

    await this.realtimeServiciosService.loadServicios();

    this.sub.add(
      this.realtimeServiciosService.servicios$.subscribe((data) => {
        this.servicios = data;
        this.aplicarFiltros();
      })
    );

    this.sub.add(
      this.route.queryParams.subscribe(params => {
        this.tipoEvento = params['tipoEvento'] || '';
        this.personas = params['personas'] ? Number(params['personas']) : null;
        this.precioMax = params['precioMax'] ? Number(params['precioMax']) : null;
        this.aplicarFiltros();
      })
    );

    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  viewServicio(id: string): void {
    this.router.navigate(['/service-details', id]);
  }

  getImageUrl(servicio: any): string {
    if (servicio?.cover_image) {
      return `https://db.buckapi.site:8091/api/files/servicios_molinera/${servicio.id}/${servicio.cover_image}`;
    }

    if (servicio?.gallery?.length) {
      return `https://db.buckapi.site:8091/api/files/servicios_molinera/${servicio.id}/${servicio.gallery[0]}`;
    }

    return 'assets/img/default-service.jpg';
  }

  aplicarFiltros(): void {
    this.serviciosFiltrados = this.servicios.filter((s: any) => {
      const categoria = (s.category || '').trim().toLowerCase();
      const filtroCategoria = (this.tipoEvento || '').trim().toLowerCase();

      const capacidadMax = Number(s.capacity_max || 0);
      const precioDesde = Number(s.price_from || 0);
      const disponible = s.available !== false;

      const categoriaOk = !filtroCategoria || categoria === filtroCategoria;
      const capacidadOk = !this.personas || capacidadMax >= this.personas;
      const precioOk = !this.precioMax || precioDesde <= this.precioMax;

      return categoriaOk && capacidadOk && precioOk && disponible;
    });
  }
}