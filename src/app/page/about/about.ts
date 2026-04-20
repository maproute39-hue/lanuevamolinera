import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { LoadStyleService } from '../../services/load-style.service';
import { ScriptLoaderService } from '../../services/script-loader.service';
import { CommonModule } from '@angular/common';
import { RealtimeServiciosService } from '../../services/servicios-realtime.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit, OnDestroy {
  servicios: any[] = [];
  loadingServicios = true;

  private serviciosSub?: Subscription;
  private loadingSub?: Subscription;
  private teamSwiper: any;

  constructor(
    private loadStyle: LoadStyleService,
    private scriptLoader: ScriptLoaderService,
    public serviciosService: RealtimeServiciosService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadingSub = this.serviciosService.isLoading$.subscribe(value => {
      this.zone.run(() => {
        this.loadingServicios = value;
        this.cdr.detectChanges();
      });
    });

    this.serviciosSub = this.serviciosService.servicios$.subscribe(data => {
      this.zone.run(() => {
        this.servicios = [...data];
        console.log('Servicios en About:', this.servicios);
        this.cdr.detectChanges();
      });
    });

    await this.cargarServicios();
    await this.loadAssets();
          window.scrollTo(0, 0);

  }

  async cargarServicios(): Promise<void> {
    try {
      await this.serviciosService.loadServicios();
    } catch (error) {
      console.error('Error cargando servicios en about:', error);
      this.zone.run(() => {
        this.loadingServicios = false;
        this.cdr.detectChanges();
      });
    }
  }

  getImageUrl(servicio: any): string {
    if (!servicio?.cover_image) {
      return 'assets/img/destination/destination_4_1.jpg';
    }

    return `https://db.buckapi.site:8091/api/files/servicios_molinera/${servicio.id}/${servicio.cover_image}`;
  }
  

  getTitulo(servicio: any): string {
    return servicio?.name || servicio?.title || servicio?.nombre || 'Servicio';
  }

  getDescripcion(servicio: any): string {
    return servicio?.description || servicio?.descripcion || 'Sin descripción disponible';
  }

  trackByServicio(index: number, servicio: any): any {
    return servicio?.id || index;
  }

  private async loadAssets(): Promise<void> {
    if (typeof document === 'undefined') return;

    try {
      await this.loadScriptsSequentially([
        'assets/js/vendor/jquery-3.6.0.min.js',
        'assets/js/bootstrap.bundle.min.js',
        'assets/js/swiper-bundle.min.js',
        'assets/js/jquery.magnific-popup.min.js',
        'assets/js/jquery.counterup.min.js',
        'assets/js/jquery-ui.min.js',
        'assets/js/imagesloaded.pkgd.min.js',
        'assets/js/isotope.pkgd.min.js',
        'assets/js/gsap.min.js',
        'assets/js/circle-progress.js',
        'assets/js/matter.min.js',
        'assets/js/matterjs-custom.js',
        'assets/js/nice-select.min.js',
        'assets/js/main.js'
      ]);

      this.initializeComponents();
    } catch (error) {
      console.error('Error loading scripts:', error);
    }
  }

  private async loadScriptsSequentially(scripts: string[]): Promise<void> {
    for (const script of scripts) {
      try {
        await this.scriptLoader.loadScript(script);
      } catch (error) {
        console.warn(`Failed to load script: ${script}`, error);
      }
    }
  }

 private initializeComponents(): void {
  if (typeof window === 'undefined' || !(window as any).Swiper) return;

  const Swiper = (window as any).Swiper;

  if (this.teamSwiper) {
    this.teamSwiper.destroy(true, true);
  }

  const teamEl = document.querySelector('#teamSlider3') as HTMLElement | null;
  if (!teamEl) return;

  this.teamSwiper = new Swiper(teamEl, {
    loop: true,
    spaceBetween: 24,
    slidesPerView: 1,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '#teamSlider3 .slider-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.team-next',
      prevEl: '.team-prev',
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      576: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      992: { slidesPerView: 3 },
      1200: { slidesPerView: 3 },
    },
  });
}

  ngOnDestroy(): void {
    this.serviciosSub?.unsubscribe();
    this.loadingSub?.unsubscribe();
  }
}