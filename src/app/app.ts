import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadStyleService } from './services/load-style.service';
import { ScriptLoaderService } from './services/script-loader.service';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('lanuevamolinera');

  constructor(
    private loadStyle: LoadStyleService,
    private scriptLoader: ScriptLoaderService
  ) {}

  ngOnInit(): void {
    this.theme();

  }
  theme() {
  this.loadStyle.loadStyle('assets/css/bootstrap.min.css');
  this.loadStyle.loadStyle('assets/css/fontawesome.min.css');
  this.loadStyle.loadStyle('assets/css/magnific-popup.min.css');
  this.loadStyle.loadStyle('assets/css/swiper-bundle.min.css');
  this.loadStyle.loadStyle('assets/css/style.css');

    if (typeof document !== 'undefined') {
      this.scriptLoader
        .loadAll([
          {src: 'assets/js/vendor/jquery-3.6.0.min.js'},
          {src: 'assets/js/swiper-bundle.min.js'}, 
          /* {src: 'assets/js/bootstrap.min.js'},
          {src: 'assets/js/jquery.magnific-popup.min.js'},
          {src: 'assets/js/jquery.counterup.min.js'},
          {src: 'assets/js/jquery-ui.min.js'},
          {src: 'assets/js/imagesloaded.pkgd.min.js'},
          {src: 'assets/js/isotope.pkgd.min.js'},
          {src: 'assets/js/gsap.min.js'},
          {src: 'assets/js/circle-progress.js'},
          {src: 'assets/js/matter.min.js'},
          {src: 'assets/js/matterjs-custom.js'},
          {src: 'assets/js/nice-select.min.js'},
          {src: 'assets/js/main.js'}, */
        ])
        .then(() => {
          console.log('Todos los scripts se han cargado correctamente');
        })
        .catch((error: any) => console.error('Error al cargar los scripts', error));
    }

  }

}
