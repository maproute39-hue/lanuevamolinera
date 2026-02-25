import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  constructor(private router: Router, public habitacionesService: RealtimeHabitacionesService) { }
openLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.classList.add('mfp-show'); // Muestra el formulario al agregar la clase
    }
  }

  closeLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.classList.remove('mfp-show'); // Oculta el formulario al eliminar la clase
    }
  }
}
