import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import PocketBase from 'pocketbase';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.html',
  styleUrls: ['./add.scss'],
})
export class Add implements OnInit, OnDestroy {
  formData = {
    nombre: '',
    descripcion: '',
    servicios: '',
    precioCOP: 0,
    precioUSD: 0,
    capacidad: '',
    img: [] as File[],
    video: null as File | null
  };

  imagePreviews: string[] = [];
  existingImages: string[] = [];
  servicesList: string[] = [];
  newService = '';
  videoPreview = '';
  existingVideoUrl = '';

  pb: PocketBase;

  isEditMode = false;
  recordId: string | null = null;
  loading = false;
  submitting = false;

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.pb = new PocketBase('https://db.buckapi.site:8091');
  }

  ngOnInit(): void {
    this.routeSub = this.route.queryParamMap.subscribe(async (params) => {
      const id = params.get('id');

      if (id) {
        this.isEditMode = true;
        this.recordId = id;
        await this.loadHabitacion(id);
      } else {
        this.isEditMode = false;
        this.recordId = null;
        this.resetForm();
      }
    });
  }

  async loadHabitacion(id: string): Promise<void> {
    this.loading = true;

    try {
      const record = await this.pb.collection('habitaciones_molinera').getOne(id);
      console.log('Habitación cargada:', record);

      // Ajusta estos nombres según los campos reales de PocketBase
      this.formData.nombre = record['nombre'] || record['name'] || '';
      this.formData.descripcion = record['descripcion'] || record['description'] || '';
      this.formData.servicios = record['servicios'] || record['services'] || '';
      this.formData.precioCOP = Number(record['precioCOP'] ?? record['price_cop'] ?? 0);
      this.formData.precioUSD = Number(record['precioUSD'] ?? record['price_usd'] ?? 0);
      this.formData.capacidad = String(record['capacidad'] ?? record['ability'] ?? '');

      this.servicesList = this.formData.servicios
        ? this.formData.servicios.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      this.existingImages = Array.isArray(record['img']) ? record['img'] : [];
      this.imagePreviews = this.existingImages.map((img: string) =>
        this.pb.files.getURL(record, img)
      );

      if (record['video']) {
        this.existingVideoUrl = this.pb.files.getURL(record, record['video']);
        this.videoPreview = this.existingVideoUrl;
      } else {
        this.existingVideoUrl = '';
        this.videoPreview = '';
      }

      this.formData.img = [];
      this.formData.video = null;
    } catch (error) {
      console.error('Error cargando habitación para editar:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la habitación.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      this.router.navigate(['/admin/habitaciones']);
    } finally {
      this.loading = false;
          this.cdr.detectChanges();

    }
  }

  onImageChange(event: any): void {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        this.formData.img.push(file);
        this.imagePreviews.push(URL.createObjectURL(file));
      });
    }
  }

  onVideoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formData.video = file;

      if (this.videoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(this.videoPreview);
      }

      this.videoPreview = URL.createObjectURL(file);
    }
  }

  removeImage(index: number): void {
    const preview = this.imagePreviews[index];

    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    if (index < this.existingImages.length) {
      this.existingImages.splice(index, 1);
    } else {
      const newFileIndex = index - this.existingImages.length;
      this.formData.img.splice(newFileIndex, 1);
    }

    this.imagePreviews.splice(index, 1);
  }

  removeVideo(): void {
    if (this.videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoPreview);
    }

    this.videoPreview = '';
    this.existingVideoUrl = '';
    this.formData.video = null;
  }

  addService(): void {
    const cleanService = this.newService.trim();
    if (!cleanService) return;

    if (!this.servicesList.includes(cleanService)) {
      this.servicesList.push(cleanService);
      this.formData.servicios = this.servicesList.join(', ');
    }

    this.newService = '';
  }

  removeService(index: number): void {
    this.servicesList.splice(index, 1);
    this.formData.servicios = this.servicesList.join(', ');
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.submitting) return;
    this.submitting = true;

    const payload = new FormData();

    // Usa aquí también los nombres reales de tu colección
    payload.append('name', this.formData.nombre);
    payload.append('description', this.formData.descripcion);
    payload.append('services', this.formData.servicios);
    payload.append('price_cop', this.formData.precioCOP.toString());
    payload.append('price_usd', this.formData.precioUSD.toString());
    payload.append('ability', this.formData.capacidad.toString());

    if (this.isEditMode) {
      this.existingImages.forEach(img => payload.append('img', img));
    }

    this.formData.img.forEach(img => {
      payload.append('img', img, img.name);
    });

    if (this.isEditMode) {
      if (!this.videoPreview) {
        payload.append('video', '');
      } else if (this.formData.video) {
        payload.append('video', this.formData.video, this.formData.video.name);
      }
    } else {
      if (this.formData.video) {
        payload.append('video', this.formData.video, this.formData.video.name);
      }
    }

    try {
      if (this.isEditMode && this.recordId) {
        await this.pb.collection('habitaciones_molinera').update(this.recordId, payload);

        await Swal.fire({
          title: 'Actualizado',
          text: 'La habitación fue actualizada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      } else {
        await this.pb.collection('habitaciones_molinera').create(payload);

        await Swal.fire({
          title: 'Éxito',
          text: '¡Habitación agregada exitosamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });

        this.resetForm();
      }

      this.router.navigate(['/admin/habitaciones']);
    } catch (error) {
      console.error('Error guardando habitación:', error);
      Swal.fire({
        title: 'Error',
        text: this.isEditMode
          ? 'Hubo un error al actualizar la habitación.'
          : 'Hubo un error al agregar la habitación.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      this.submitting = false;
    }
  }

  resetForm(): void {
    this.imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    if (this.videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoPreview);
    }

    this.formData = {
      nombre: '',
      descripcion: '',
      servicios: '',
      precioCOP: 0,
      precioUSD: 0,
      capacidad: '',
      img: [],
      video: null
    };

    this.servicesList = [];
    this.newService = '';
    this.imagePreviews = [];
    this.existingImages = [];
    this.videoPreview = '';
    this.existingVideoUrl = '';
  }

  get precioCOPDisplay(): string {
    return this.formData.precioCOP.toLocaleString('es-CO');
  }

  set precioCOPDisplay(value: string) {
    const num = value.replace(/\./g, '');
    this.formData.precioCOP = parseFloat(num) || 0;
  }

  get precioUSDDisplay(): string {
    return this.formData.precioUSD.toLocaleString('en-US');
  }

  set precioUSDDisplay(value: string) {
    const num = value.replace(/,/g, '');
    this.formData.precioUSD = parseFloat(num) || 0;
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();

    this.imagePreviews.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    if (this.videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoPreview);
    }
  }
}