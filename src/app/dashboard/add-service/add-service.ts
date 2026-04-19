import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import PocketBase from 'pocketbase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-service.html',
  styleUrl: './add-service.scss',
})
export class AddService implements OnInit, OnDestroy {
  formData = {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    category: '',
    status: 'active',
    featured: false,
    price_from: 0,
    capacity_min: 0,
    capacity_max: 0,
    duration_hours: 0,
    includes: '',
    not_includes: '',
    tags: '',
    cover_image: null as File | null,
    gallery: [] as File[],
    video: null as File | null,
    sort_order: 0,
    location_type: '',
    available: true,
    notes: ''
  };

  pb: PocketBase;

  isEditMode = false;
  recordId: string | null = null;
  loading = false;
  submitting = false;

  coverPreview = '';
  galleryPreviews: string[] = [];
  existingGallery: string[] = [];

  videoPreview = '';
  existingVideoUrl = '';
  existingCover = '';

  private routeSub?: Subscription;

  categories = [
    'boda',
    'cumpleaños',
    'reunión',
    'evento_corporativo',
    'aniversario',
    'cena_privada',
    'brunch',
    'celebración_especial'
  ];

  locationTypes = ['interior', 'exterior', 'mixto'];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.pb = new PocketBase('https://db.buckapi.site:8091');
  }

  ngOnInit(): void {
    this.routeSub = this.route.queryParamMap.subscribe(async params => {
      const id = params.get('id');

      if (id) {
        this.isEditMode = true;
        this.recordId = id;
        await this.loadServicio(id);
      } else {
        this.isEditMode = false;
        this.recordId = null;
        this.resetForm();
      }
    });
  }

  async loadServicio(id: string): Promise<void> {
    this.loading = true;

    try {
      const record = await this.pb.collection('servicios_molinera').getOne(id);
      console.log('Servicio cargado:', record);

      this.formData = {
        name: record['name'] || '',
        slug: record['slug'] || '',
        description: record['description'] || '',
        short_description: record['short_description'] || '',
        category: record['category'] || '',
        status: record['status'] || 'active',
        featured: !!record['featured'],
        price_from: Number(record['price_from']) || 0,
        capacity_min: Number(record['capacity_min']) || 0,
        capacity_max: Number(record['capacity_max']) || 0,
        duration_hours: Number(record['duration_hours']) || 0,
        includes: record['includes'] || '',
        not_includes: record['not_includes'] || '',
        tags: record['tags'] || '',
        cover_image: null,
        gallery: [],
        video: null,
        sort_order: Number(record['sort_order']) || 0,
        location_type: record['location_type'] || '',
        available: record['available'] !== false,
        notes: record['notes'] || ''
      };

      this.existingCover = record['cover_image'] || '';
      this.coverPreview = this.existingCover
        ? this.pb.files.getURL(record, this.existingCover)
        : '';

      this.existingGallery = Array.isArray(record['gallery']) ? record['gallery'] : [];
      this.galleryPreviews = this.existingGallery.map((img: string) =>
        this.pb.files.getURL(record, img)
      );

      if (record['video']) {
        this.existingVideoUrl = this.pb.files.getURL(record, record['video']);
        this.videoPreview = this.existingVideoUrl;
      } else {
        this.existingVideoUrl = '';
        this.videoPreview = '';
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error cargando servicio:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el servicio.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      this.router.navigate(['/admin/servicios']);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onCoverChange(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.formData.cover_image = file;

    if (this.coverPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.coverPreview);
    }

    this.coverPreview = URL.createObjectURL(file);
  }

  onGalleryChange(event: any): void {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      this.formData.gallery.push(file);
      this.galleryPreviews.push(URL.createObjectURL(file));
    });
  }

  onVideoChange(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.formData.video = file;

    if (this.videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoPreview);
    }

    this.videoPreview = URL.createObjectURL(file);
  }

  removeCover(): void {
    if (this.coverPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.coverPreview);
    }

    this.coverPreview = '';
    this.existingCover = '';
    this.formData.cover_image = null;
  }

  removeGalleryImage(index: number): void {
    const preview = this.galleryPreviews[index];

    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    if (index < this.existingGallery.length) {
      this.existingGallery.splice(index, 1);
    } else {
      const newFileIndex = index - this.existingGallery.length;
      this.formData.gallery.splice(newFileIndex, 1);
    }

    this.galleryPreviews.splice(index, 1);
  }

  removeVideo(): void {
    if (this.videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoPreview);
    }

    this.videoPreview = '';
    this.existingVideoUrl = '';
    this.formData.video = null;
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.submitting) return;
    this.submitting = true;

    const payload = new FormData();

    payload.append('name', this.formData.name);
    payload.append('slug', this.formData.slug);
    payload.append('description', this.formData.description);
    payload.append('short_description', this.formData.short_description);
    payload.append('category', this.formData.category);
    payload.append('status', this.formData.status);
    payload.append('featured', String(this.formData.featured));
    payload.append('price_from', String(this.formData.price_from));
    payload.append('capacity_min', String(this.formData.capacity_min));
    payload.append('capacity_max', String(this.formData.capacity_max));
    payload.append('duration_hours', String(this.formData.duration_hours));
    payload.append('includes', this.formData.includes);
    payload.append('not_includes', this.formData.not_includes);
    payload.append('tags', this.formData.tags);
    payload.append('sort_order', String(this.formData.sort_order));
    payload.append('location_type', this.formData.location_type);
    payload.append('available', String(this.formData.available));
    payload.append('notes', this.formData.notes);

    if (this.isEditMode) {
      if (!this.coverPreview) {
        payload.append('cover_image', '');
      } else if (this.formData.cover_image) {
        payload.append('cover_image', this.formData.cover_image, this.formData.cover_image.name);
      }

      this.existingGallery.forEach(img => {
        payload.append('gallery', img);
      });
    } else {
      if (this.formData.cover_image) {
        payload.append('cover_image', this.formData.cover_image, this.formData.cover_image.name);
      }
    }

    this.formData.gallery.forEach(img => {
      payload.append('gallery', img, img.name);
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
        await this.pb.collection('servicios_molinera').update(this.recordId, payload);

        await Swal.fire({
          title: 'Actualizado',
          text: 'El servicio fue actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      } else {
        await this.pb.collection('servicios_molinera').create(payload);

        await Swal.fire({
          title: 'Éxito',
          text: 'Servicio agregado exitosamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });

        this.resetForm();
      }

      this.router.navigate(['/admin/servicios']);
    } catch (error) {
      console.error('Error guardando servicio:', error);
      Swal.fire({
        title: 'Error',
        text: this.isEditMode
          ? 'Hubo un error al actualizar el servicio.'
          : 'Hubo un error al agregar el servicio.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      this.submitting = false;
    }
  }

  resetForm(): void {
    if (this.coverPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.coverPreview);
    }

    this.galleryPreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    if (this.videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoPreview);
    }

    this.formData = {
      name: '',
      slug: '',
      description: '',
      short_description: '',
      category: '',
      status: 'active',
      featured: false,
      price_from: 0,
      capacity_min: 0,
      capacity_max: 0,
      duration_hours: 0,
      includes: '',
      not_includes: '',
      tags: '',
      cover_image: null,
      gallery: [],
      video: null,
      sort_order: 0,
      location_type: '',
      available: true,
      notes: ''
    };

    this.coverPreview = '';
    this.galleryPreviews = [];
    this.existingGallery = [];
    this.videoPreview = '';
    this.existingVideoUrl = '';
    this.existingCover = '';
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();

    if (this.coverPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.coverPreview);
    }

    this.galleryPreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    if (this.videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoPreview);
    }
  }
}
