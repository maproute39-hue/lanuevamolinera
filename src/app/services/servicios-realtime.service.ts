import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject } from 'rxjs';
import { Servicio } from '../models/servicio.model';

@Injectable({
  providedIn: 'root'
})
export class RealtimeServiciosService implements OnDestroy {
  private pb: PocketBase;
  private realtimeSubscribed = false;

  private serviciosSubject = new BehaviorSubject<Servicio[]>([]);
  servicios$ = this.serviciosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.site:8091');
    this.initRealtime();
  }

  private mapServicio(record: any): Servicio {
    return {
      id: record.id,
      name: record.name || '',
      slug: record.slug || '',
      description: record.description || '',
      short_description: record.short_description || '',
      category: record.category || '',
      status: record.status || 'active',
      featured: !!record.featured,
      price_from: Number(record.price_from) || 0,
      capacity_min: Number(record.capacity_min) || 0,
      capacity_max: Number(record.capacity_max) || 0,
      duration_hours: Number(record.duration_hours) || 0,
      includes: record.includes || '',
      not_includes: record.not_includes || '',
      tags: record.tags || '',
      cover_image: record.cover_image || '',
      gallery: Array.isArray(record.gallery) ? record.gallery : [],
      video: record.video || '',
      sort_order: Number(record.sort_order) || 0,
      location_type: record.location_type || '',
      available: record.available !== false,
      notes: record.notes || '',
      created: record.created,
      updated: record.updated
    };
  }

  async loadServicios(): Promise<void> {
    this.loadingSubject.next(true);

    try {
      const records = await this.pb.collection('servicios_molinera').getFullList({
        sort: '-created'
      });

      const servicios = records.map((record: any) => this.mapServicio(record));
      this.serviciosSubject.next(servicios);

      console.log('[RealtimeServiciosService] Cargados', servicios.length, 'servicios');
    } catch (error) {
      console.error('[RealtimeServiciosService] Error cargando servicios:', error);
      this.serviciosSubject.next([]);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private initRealtime(): void {
    if (this.realtimeSubscribed) return;

    this.realtimeSubscribed = true;

    this.pb.collection('servicios_molinera').subscribe('*', async () => {
      try {
        const records = await this.pb.collection('servicios_molinera').getFullList({
          sort: '-created'
        });

        const servicios = records.map((record: any) => this.mapServicio(record));
        this.serviciosSubject.next(servicios);

        console.log('[RealtimeServiciosService] Lista actualizada por realtime');
      } catch (error) {
        console.error('[RealtimeServiciosService] Error en realtime:', error);
      }
    });
  }

  async getServicioById(id: string): Promise<any> {
    return await this.pb.collection('servicios_molinera').getOne(id);
  }

  async deleteServicio(id: string): Promise<void> {
    await this.pb.collection('servicios_molinera').delete(id);

    const current = this.serviciosSubject.value.filter(servicio => servicio.id !== id);
    this.serviciosSubject.next(current);
  }

  getFileUrl(record: any, filename: string): string {
    return this.pb.files.getURL(record, filename);
  }

  ngOnDestroy(): void {
    this.pb.collection('servicios_molinera').unsubscribe('*');
  }
}