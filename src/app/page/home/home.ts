import { Component, OnInit } from '@angular/core';
import { LoadStyleService } from '../../services/load-style.service';
import { ScriptLoaderService } from '../../services/script-loader.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  constructor(
    private loadStyle: LoadStyleService,
    private scriptLoader: ScriptLoaderService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadAssets();
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

}