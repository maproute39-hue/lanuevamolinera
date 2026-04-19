import { Injectable, OnDestroy } from '@angular/core';
import PocketBase, { RecordSubscription } from 'pocketbase';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Habitacion } from '../models/habitacion.model';

// Actualizamos la interfaz para extender de RecordSubscription
export interface RealtimeEvent extends Omit<RecordSubscription<Habitacion>, 'action'> {
  action: 'create' | 'update' | 'delete';
  record: Habitacion;
}

@Injectable({
  providedIn: 'root',
})
export class RealtimeHabitacionesService implements OnDestroy {
  private pb: PocketBase;
  private readonly COLLECTION = 'habitaciones_molinera';
  private isSubscribed = false;
  
  // Subject para la lista completa de inspecciones
  private habitacionesSubject = new BehaviorSubject<Habitacion[]>([]);
  public habitaciones$: Observable<Habitacion[]> = this.habitacionesSubject.asObservable();
  
  // Subject para eventos en tiempo real individuales
  private eventsSubject = new Subject<RealtimeEvent>();
  public events$: Observable<RealtimeEvent> = this.eventsSubject.asObservable();
  
  // Subject para errores
  private errorSubject = new Subject<Error>();
  public errors$: Observable<Error> = this.errorSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);

  public get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * Elimina una inspección por su ID
   * @param id ID de la inspección a eliminar
   * @returns Promesa que se resuelve cuando se completa la eliminación
   */
  public async deleteHabitacion(id: string): Promise<boolean> {
  try {
    await this.pb.collection(this.COLLECTION).delete(id);
    return true;
  } catch (error) {
    console.error('Error al eliminar la habitación:', error);
    throw error;
  }
}

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.site:8091');
    
    this.pb.authStore.onChange((token, model) => {
      if (!token && this.isSubscribed) {
        console.warn('[RealtimeHabitacionesService] Sesión expirada, suscripciones pausadas');
        this.unsubscribeAll();
      }
    });
    this.subscribe();
  }

  async subscribe(autoLoad: boolean = true): Promise<void> {
    if (this.isSubscribed) {
      console.log('[RealtimeHabitacionesService] Ya está suscrito');
      return;
    }

    try {
      if (!this.pb.authStore.isValid) {
        console.warn('[RealtimeHabitacionesService] No hay sesión activa. Conéctate primero.');
      }

      // Actualizamos la suscripción con el tipado correcto
      this.pb.collection(this.COLLECTION).subscribe('*', (event: RecordSubscription<Habitacion>) => {
        if (['create', 'update', 'delete'].includes(event.action)) {
          const mappedEvent: RealtimeEvent = {
            ...event,
            action: event.action as 'create' | 'update' | 'delete'
          };
          console.log('[Realtime] Evento recibido:', mappedEvent.action, mappedEvent.record.id);
          this.eventsSubject.next(mappedEvent);
          this.handleRealtimeEvent(mappedEvent);
        }
      });

      this.isSubscribed = true;
      console.log('[RealtimeHabitacionesService] ✓ Suscripción activa');

      if (autoLoad) {
        await this.loadHabitaciones();
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  /**
   * Manejar eventos en tiempo real
   */
  private handleRealtimeEvent(event: RealtimeEvent): void {
    const currentInspections = this.habitacionesSubject.value;

    switch (event.action) {
      case 'create':
        // Agregar al inicio (más reciente primero)
        this.habitacionesSubject.next([event.record, ...currentInspections]);
        break;

      case 'update':
        // Buscar y actualizar el registro
        const updatedList = currentInspections.map(insp =>
          insp.id === event.record.id ? event.record : insp
        );
        this.habitacionesSubject.next(updatedList);
        break;

      case 'delete':
        // Eliminar el registro
        this.habitacionesSubject.next(
          currentInspections.filter(insp => insp.id !== event.record.id)
        );
        break;
    }
  }

  /**
   * Cargar lista completa de inspecciones
   */
  async loadHabitaciones(sort: string = '-created'): Promise<void> {
  this.loadingSubject.next(true);

  try {
    const records = await this.pb
      .collection(this.COLLECTION)
      .getFullList<Habitacion>(200, { sort });

    console.log(`[RealtimeHabitacionesService] Cargadas ${records.length} habitaciones`);
    this.habitacionesSubject.next(records);
  } catch (error) {
    this.handleError(error);
    throw error;
  } finally {
    this.loadingSubject.next(false);
  }
}

  /**
   * Obtener inspecciones con paginación
   */
  async getHabitacionesPaginated(
    page: number = 1,
    perPage: number = 50,
    sort: string = '-created',
    filter?: string
  ): Promise<{ items: Habitacion[], totalItems: number, totalPages: number }> {
    try {
      const response = await this.pb.collection(this.COLLECTION).getList(page, perPage, {
        sort,
        filter
      });
      
      return {
        items: response.items as unknown as Habitacion[],
        totalItems: response.totalItems,
        totalPages: response.totalPages
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener una inspección por ID
   */
  async getHabitacionById(id: string): Promise<Habitacion> {
    try {
      const record = await this.pb.collection(this.COLLECTION).getOne<Habitacion>(id);
      return record;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Desuscribirse de todos los eventos
   */
  unsubscribeAll(): void {
    try {
      this.pb.collection(this.COLLECTION).unsubscribe();
      this.isSubscribed = false;
      console.log('[RealtimeHabitacionesService] ✗ Suscripciones eliminadas');
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Verificar si está suscrito actualmente
   */
  isCurrentlySubscribed(): boolean {
    return this.isSubscribed;
  }

  /**
   * Autenticar usuario (deberías hacer esto desde un servicio de autenticación)
   */
  async authenticate(email: string, password: string): Promise<void> {
    try {
      await this.pb.collection('users').authWithPassword(email, password);
      console.log('[RealtimeHabitacionesService] ✓ Autenticación exitosa');
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.unsubscribeAll();
    this.pb.authStore.clear();
    this.habitacionesSubject.next([]);
    console.log('[RealtimeHabitacionesService] ✓ Sesión cerrada');
  }

  /**
   * Verificar si hay usuario autenticado
   */
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.pb.authStore.model;
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): void {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[RealtimeHabitacionesService] Error:', err);
    this.errorSubject.next(err);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
    this.habitacionesSubject.complete();
    this.eventsSubject.complete();
    this.errorSubject.complete();
  }
}