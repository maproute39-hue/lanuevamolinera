import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import PocketBase from 'pocketbase';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-menu.html',
  styleUrl: './add-menu.scss',
})
export class AddMenu implements OnInit, OnDestroy {
  formData = {
    name: '',
    description: '',
    short_description: '',
    category: '',
    price_cop: 0,
    price_usd: 0,
    featured: false,
    avalible: true,
    images: [] as File[],
    cover_image: null as File | null,
    video: null as File | null,
    ingredients: '',
    tags: '',
    preparation_time: 0,
    sort_order: 0,
    status: 'active',
    notes: ''
  };

  pb: PocketBase;

  isEditMode = false;
  recordId: string | null = null;
  loading = false;
  submitting = false;

  coverPreview = '';
  galleryPreviews: string[] = [];
  existingImages: string[] = [];

  videoPreview = '';
  existingVideoUrl = '';
  existingCover = '';

  private routeSub?: Subscription;

  categories = [
    'desayuno',
    'almuerzo',
    'cena',
    'entrada',
    'bebida',
    'postre',
    'parrilla',
    'especial'
  ];

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
        await this.loadPlato(id);
      } else {
        this.isEditMode = false;
        this.recordId = null;
        this.resetForm();
      }
    });
  }

  async loadPlato(id: string): Promise<void> {
    this.loading = true;

    try {
      const record = await this.pb.collection('menu_molinera').getOne(id);
      console.log('Plato cargado:', record);

      this.formData = {
        name: record['name'] || '',
        description: record['description'] || '',
        short_description: record['short_description'] || '',
        category: record['category'] || '',
        price_cop: Number(record['price_cop']) || 0,
        price_usd: Number(record['price_usd']) || 0,
        featured: !!record['featured'],
        avalible: record['avalible'] !== false,
        images: [],
        cover_image: null,
        video: null,
        ingredients: record['ingredients'] || '',
        tags: record['tags'] || '',
        preparation_time: Number(record['preparation_time']) || 0,
        sort_order: Number(record['sort_order']) || 0,
        status: record['status'] || 'active',
        notes: record['notes'] || ''
      };

      this.existingCover = record['cover_image'] || '';
      this.coverPreview = this.existingCover
        ? this.pb.files.getURL(record, this.existingCover)
        : '';

      this.existingImages = Array.isArray(record['images']) ? record['images'] : [];
      this.galleryPreviews = this.existingImages.map((img: string) =>
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
      console.error('Error cargando plato:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el plato.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      this.router.navigate(['/admin/menu']);
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

  onImagesChange(event: any): void {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      this.formData.images.push(file);
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

  removeImage(index: number): void {
    const preview = this.galleryPreviews[index];

    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    if (index < this.existingImages.length) {
      this.existingImages.splice(index, 1);
    } else {
      const newFileIndex = index - this.existingImages.length;
      this.formData.images.splice(newFileIndex, 1);
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
    payload.append('description', this.formData.description);
    payload.append('short_description', this.formData.short_description);
    payload.append('category', this.formData.category);
    payload.append('price_cop', String(this.formData.price_cop));
    payload.append('price_usd', String(this.formData.price_usd));
    payload.append('featured', String(this.formData.featured));
    payload.append('avalible', String(this.formData.avalible));
    payload.append('ingredients', this.formData.ingredients);
    payload.append('tags', this.formData.tags);
    payload.append('preparation_time', String(this.formData.preparation_time));
    payload.append('sort_order', String(this.formData.sort_order));
    payload.append('status', this.formData.status);
    payload.append('notes', this.formData.notes);

    if (this.isEditMode) {
      if (!this.coverPreview) {
        payload.append('cover_image', '');
      } else if (this.formData.cover_image) {
        payload.append('cover_image', this.formData.cover_image, this.formData.cover_image.name);
      }

      this.existingImages.forEach(img => {
        payload.append('images', img);
      });
    } else {
      if (this.formData.cover_image) {
        payload.append('cover_image', this.formData.cover_image, this.formData.cover_image.name);
      }
    }

    this.formData.images.forEach(img => {
      payload.append('images', img, img.name);
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
        await this.pb.collection('menu_molinera').update(this.recordId, payload);

        await Swal.fire({
          title: 'Actualizado',
          text: 'El plato fue actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      } else {
        await this.pb.collection('menu_molinera').create(payload);

        await Swal.fire({
          title: 'Éxito',
          text: 'Plato agregado exitosamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });

        this.resetForm();
      }

      this.router.navigate(['/admin/menu']);
    } catch (error) {
      console.error('Error guardando plato:', error);
      Swal.fire({
        title: 'Error',
        text: this.isEditMode
          ? 'Hubo un error al actualizar el plato.'
          : 'Hubo un error al agregar el plato.',
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
      description: '',
      short_description: '',
      category: '',
      price_cop: 0,
      price_usd: 0,
      featured: false,
      avalible: true,
      images: [],
      cover_image: null,
      video: null,
      ingredients: '',
      tags: '',
      preparation_time: 0,
      sort_order: 0,
      status: 'active',
      notes: ''
    };

    this.coverPreview = '';
    this.galleryPreviews = [];
    this.existingImages = [];
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
