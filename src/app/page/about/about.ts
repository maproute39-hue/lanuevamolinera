import { Component } from '@angular/core';
import { LoadStyleService } from '../../services/load-style.service';
import { ScriptLoaderService } from '../../services/script-loader.service';
@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  constructor(
    private loadStyle: LoadStyleService,
    private scriptLoader: ScriptLoaderService
  ) {}
 async ngOnInit(): Promise<void> {
    await this.loadAssets();
  }

  private async loadAssets(): Promise<void> {
    // Load CSS

    
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
}
