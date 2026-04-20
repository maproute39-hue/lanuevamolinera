import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { LoadStyleService } from '../../services/load-style.service';
import { ScriptLoaderService } from '../../services/script-loader.service';
import { Observable } from 'rxjs';
import { Habitacion } from '../../models/habitacion.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';
import { FormsModule } from '@angular/forms';
import { RealtimeServiciosService } from '../../services/servicios-realtime.service';
// Add these type declarations
declare global {
  interface Window {
    Swiper: typeof import('swiper').default;
  }
}

// Extend the Element interface to include Swiper's instance property
declare global {
  interface Element {
    swiper?: any; // Using 'any' as a fallback for Swiper instance
  }
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  isBrowser: boolean = false;

  habitaciones$!: Observable<Habitacion[]>;

  constructor(
    private loadStyle: LoadStyleService,
    private scriptLoader: ScriptLoaderService,
    public router: Router,
    public realtimeHabitacionesService: RealtimeHabitacionesService,
    public realtimeServiciosService: RealtimeServiciosService,
    @Inject(PLATFORM_ID) private platformId: Object
) {
  this.habitaciones$ = this.realtimeHabitacionesService.habitaciones$;
  this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    await this.loadAssets();
    this.realtimeHabitacionesService.habitaciones$.subscribe((habitaciones) => {
      console.log(habitaciones);
    });
     if (!this.isBrowser) return;

      window.scrollTo(0, 0);
  }
form = {
  tipo: 'habitacion' as 'habitacion' | 'evento',
  checkin: '',
  checkout: '',
  personas: 1,
  categoria: '',
  precioMin: null as number | null,
  precioMax: null as number | null,
  tipoHabitacion: '',
  comodidades: [] as string[]
};

async onSearch() {
  try {
    if (this.form.tipo === 'habitacion') {
      const resultados = await this.realtimeHabitacionesService.searchHabitaciones({
        personas: this.form.personas,
        precioMax: this.form.precioMax,
        tipoHabitacion: this.form.tipoHabitacion || null
      });

      this.router.navigate(['/rooms'], {
        state: {
          resultados,
          filtros: { ...this.form }
        }
      });
    } else {
      const resultados = await this.realtimeServiciosService.searchServicios({
        categoria: this.form.categoria || undefined,
        precioMax: this.form.precioMax
      });

      this.router.navigate(['/services'], {
        state: {
          resultados,
          filtros: { ...this.form }
        }
      });
    }
  } catch (error) {
    console.error('Error en búsqueda:', error);
  }
}
  private async loadAssets(): Promise<void> {
    // Load CSS
    this.loadStyles();
    
    if (typeof document === 'undefined') return;

    try {
      // Load scripts in sequence to ensure dependencies are met
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

      // Initialize components after all scripts are loaded
      this.initializeComponents();
    } catch (error) {
      console.error('Error loading scripts:', error);
    }
  }

  private loadStyles(): void {
    const styles = [
      'assets/css/bootstrap.min.css',
      'assets/css/fontawesome.min.css',
      'assets/css/magnific-popup.min.css',
      'assets/css/swiper-bundle.min.css',
      'assets/css/style.css'
    ];
    
    styles.forEach(style => this.loadStyle.loadStyle(style));
  }

  private async loadScriptsSequentially(scripts: string[]): Promise<void> {
    for (const script of scripts) {
      try {
        await this.scriptLoader.loadScript(script);
      } catch (error) {
        console.warn(`Failed to load script: ${script}`, error);
        // Continue with next script even if one fails
      }
    }
  }

  private initializeComponents(): void {
    if (typeof window !== 'undefined' && window.Swiper) {
      const swipers = document.querySelectorAll('.swiper');
      swipers.forEach((swiperEl: Element) => {
        if (swiperEl && !(swiperEl as any).swiper) {
          new window.Swiper(swiperEl as HTMLElement, {
            loop: true,
            autoplay: {
              delay: 5000,
              disableOnInteraction: false,
            },
            // Add other Swiper options as needed
          });
        }
      });
    }
  }

  viewHabitacion(id: string) {
    this.router.navigate(['/room-details', id]);
  }
}