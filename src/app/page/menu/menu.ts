import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import PocketBase from 'pocketbase';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit, OnDestroy {
  pb = new PocketBase('https://db.buckapi.site:8091');

  platos: any[] = [];
  filteredPlatos: any[] = [];
  categories: string[] = [];

  selectedCategory = 'todos';
  loading = true;
  error = false;

  galleryModalOpen = false;
  galleryImages: string[] = [];
  galleryCurrentIndex = 0;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.loadMenu();
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  async loadMenu(): Promise<void> {
    this.loading = true;
    this.error = false;

    try {
      console.log('Intentando cargar menú desde menu_molinera...');

      const records = await this.pb.collection('menu_molinera').getFullList({
        sort: '+sort_order,-featured,-created'
      });

      console.log('Menú cargado exitosamente:', records.length, 'platos');

      this.platos = records.map(item => ({
        ...item,
        category: (item['category'] || 'otros').toLowerCase().trim()
      }));

      this.categories = [
        'todos',
        ...Array.from(new Set(this.platos.map(item => item['category']))).sort()
      ];

      this.applyCategoryFilter('todos');
    } catch (error) {
      console.error('Error cargando menú:', error);
      this.error = true;

      // Si la colección no existe, mostrar mensaje específico
      if (error instanceof Error && error.message.includes('collection')) {
        console.warn('La colección menu_molinera no existe en PocketBase');
      }
    } finally {
      this.loading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  applyCategoryFilter(category: string): void {
    this.selectedCategory = category;

    if (category === 'todos') {
      this.filteredPlatos = [...this.platos];
    } else {
      this.filteredPlatos = this.platos.filter(item => item['category'] === category);
    }

    this.changeDetectorRef.detectChanges();
  }

  getCoverImage(plato: any): string {
    const fileName = plato['cover_image'] || plato['images']?.[0];
    if (!fileName) return 'assets/img/default-food.jpg';

    return `https://db.buckapi.site:8091/api/files/menu_molinera/${plato.id}/${fileName}`;
  }

  getGalleryImages(plato: any): string[] {
    const images = plato['images']?.length ? plato['images'] : (plato['cover_image'] ? [plato['cover_image']] : []);
    return images.map((fileName: string) =>
      `https://db.buckapi.site:8091/api/files/menu_molinera/${plato.id}/${fileName}`
    );
  }

  getTagsList(plato: any): string[] {
    if (!plato?.tags) return [];

    return String(plato.tags)
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => !!tag);
  }

  getIngredientsList(plato: any): string[] {
    if (!plato?.ingredients) return [];

    return String(plato.ingredients)
      .split(/,|\n|•|-/)
      .map((item: string) => item.trim())
      .filter((item: string) => !!item);
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

  categoryLabel(category: string): string {
    if (!category) return 'Otros';
    return category.charAt(0).toUpperCase() + category.slice(1);
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
}
