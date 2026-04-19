import { Component, Inject, OnInit, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';
import { Habitacion } from '../../models/habitacion.model';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import PocketBase from 'pocketbase';
import { Observable, from, map, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './room-details.html',
  styleUrl: './room-details.scss',
})
export class RoomDetails implements OnInit, OnDestroy {
    isBrowser: boolean = false;
  pb = new PocketBase('https://db.buckapi.site:8091');
  galleryModalOpen = false;
galleryImages: string[] = [];
galleryCurrentIndex = 0;
  habitacion$!: Observable<any>;
  bookingForm!: FormGroup;

  readonly whatsappNumber = '584147015219';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.habitacion$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => from(this.pb.collection('habitaciones_molinera').getOne(id || '')))
    );
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      email: ['', [Validators.email]],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      adults: [2, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]],
      rooms: [1, [Validators.required, Validators.min(1)]],
      currency: ['USD', Validators.required],
      message: ['']
    });
  }

  submitBooking(habitacion: any): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const whatsappUrl = this.getWhatsAppBookingLink(habitacion);
    window.open(whatsappUrl, '_blank');
  }

  getWhatsAppBookingLink(habitacion: any): string {
    const values = this.bookingForm.value;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const priceReference =
      values.currency === 'USD'
        ? this.formatCurrency(habitacion.price_usd, 'USD')
        : this.formatCurrency(habitacion.price_cop, 'COP');

    const message = `Hola, me gustaría reservar en La Nueva Molinera.

*Habitación:* ${habitacion.name || 'No especificada'}
*Capacidad:* ${habitacion.ability || 'No especificada'}
*Precio referencial:* ${priceReference}

*Nombre:* ${values.fullName}
*WhatsApp:* ${values.phone}
*Correo:* ${values.email || 'No indicado'}
*Entrada:* ${values.checkIn}
*Salida:* ${values.checkOut}
*Adultos:* ${values.adults}
*Niños:* ${values.children}
*Habitaciones:* ${values.rooms}
*Moneda de referencia:* ${values.currency}
*Mensaje adicional:* ${values.message || 'Sin observaciones'}

*Enlace de la habitación:* ${currentUrl}`;

    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  formatCurrency(value: number, currency: 'USD' | 'COP'): string {
    if (value === null || value === undefined) return 'Consultar';

    return new Intl.NumberFormat(
      currency === 'USD' ? 'en-US' : 'es-CO',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  getRoomImageUrl(habitacion: any, fileName?: string): string {
    const image = fileName || habitacion?.img?.[0];
    if (!image) return 'assets/img/default-room.jpg';

    return `https://db.buckapi.site:8091/api/files/habitaciones_molinera/${habitacion.id}/${image}`;
  }

  getRoomGallery(habitacion: any): string[] {
    if (!habitacion?.img?.length) return [];
    return habitacion.img.map((fileName: string) => this.getRoomImageUrl(habitacion, fileName));
  }

  getRoomServices(habitacion: any): string[] {
    if (!habitacion?.services) return [];

    try {
      const parsed = typeof habitacion.services === 'string'
        ? JSON.parse(habitacion.services)
        : habitacion.services;

      if (Array.isArray(parsed)) return parsed;

      if (parsed && typeof parsed === 'object') {
        return Object.values(parsed).filter(Boolean) as string[];
      }

      return [];
    } catch {
      return String(habitacion.services)
        .split(/,|\n|•|-/)
        .map((item: string) => item.trim())
        .filter((item: string) => !!item);
    }
  }
  openGallery(images: string[], startIndex: number = 0): void {
  if (!images?.length) return;

  this.galleryImages = images;
  this.galleryCurrentIndex = startIndex;
  this.galleryModalOpen = true;

  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  }
}

closeGallery(): void {
  this.galleryModalOpen = false;
  this.galleryImages = [];
  this.galleryCurrentIndex = 0;

  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

prevImage(): void {
  if (!this.galleryImages.length) return;

  this.galleryCurrentIndex =
    this.galleryCurrentIndex === 0
      ? this.galleryImages.length - 1
      : this.galleryCurrentIndex - 1;
}

nextImage(): void {
  if (!this.galleryImages.length) return;

  this.galleryCurrentIndex =
    this.galleryCurrentIndex === this.galleryImages.length - 1
      ? 0
      : this.galleryCurrentIndex + 1;
}

goToImage(index: number): void {
  this.galleryCurrentIndex = index;
}
ngOnDestroy(): void {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}
}