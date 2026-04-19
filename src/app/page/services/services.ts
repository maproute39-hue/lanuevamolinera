import { Component, OnInit } from '@angular/core';
import { RealtimeServiciosService } from '../../services/servicios-realtime.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements OnInit {
  servicios$!: Observable<any[]>;

  constructor(
    public realtimeServiciosService: RealtimeServiciosService,
    public router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.servicios$ = this.realtimeServiciosService.servicios$;
    await this.realtimeServiciosService.loadServicios();
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
}