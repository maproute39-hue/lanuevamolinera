import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject } from 'rxjs';
import { Plato } from '../models/plato.model';

@Injectable({
  providedIn: 'root'
})
export class RealtimeMenuService implements OnDestroy {
  private pb: PocketBase;
  private realtimeSubscribed = false;

  private platosSubject = new BehaviorSubject<Plato[]>([]);
  platos$ = this.platosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.site:8091');
    this.initRealtime();
    this.loadPlatos(); // Cargar datos iniciales
  }

  private mapPlato(record: any): Plato {
    return {
      id: record.id,
      name: record.name || '',
      description: record.description || '',
      short_description: record.short_description || '',
      category: record.category || '',
      price_cop: Number(record.price_cop) || 0,
      price_usd: Number(record.price_usd) || 0,
      featured: !!record.featured,
      available: record.available !== false,
      images: Array.isArray(record.images) ? record.images : [],
      cover_image: record.cover_image || '',
      video: record.video || '',
      ingredients: record.ingredients || '',
      tags: record.tags || '',
      preparation_time: Number(record.preparation_time) || 0,
      sort_order: Number(record.sort_order) || 0,
      status: record.status || 'active',
      notes: record.notes || '',
      created: record.created,
      updated: record.updated
    };
  }

  async loadPlatos(): Promise<void> {
    this.loadingSubject.next(true);

    try {
      const records = await this.pb.collection('menu_molinera').getFullList({
        sort: '-created'
      });

      const platos = records.map((record: any) => this.mapPlato(record));
      this.platosSubject.next([...platos]);

      console.log('[RealtimeMenuService] Cargados', platos.length, 'platos');
    } catch (error) {
      console.error('[RealtimeMenuService] Error cargando platos:', error);
      this.platosSubject.next([]);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private initRealtime(): void {
    if (this.realtimeSubscribed) return;

    this.realtimeSubscribed = true;

    this.pb.collection('menu_molinera').subscribe('*', async () => {
      try {
        const records = await this.pb.collection('menu_molinera').getFullList({
          sort: '-created'
        });

        const platos = records.map((record: any) => this.mapPlato(record));
        this.platosSubject.next([...platos]);

        console.log('[RealtimeMenuService] Lista actualizada por realtime');
      } catch (error) {
        console.error('[RealtimeMenuService] Error en realtime:', error);
      }
    });
  }

  async getPlatoById(id: string): Promise<any> {
    return await this.pb.collection('menu_molinera').getOne(id);
  }

  async deletePlato(id: string): Promise<void> {
    await this.pb.collection('menu_molinera').delete(id);

    const current = this.platosSubject.value.filter(plato => plato.id !== id);
    this.platosSubject.next([...current]);
  }

  getFileUrl(record: any, filename: string): string {
    return this.pb.files.getURL(record, filename);
  }

  ngOnDestroy(): void {
    this.pb.collection('menu_molinera').unsubscribe('*');
  }
}