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
 // 🔐 Credenciales temporales
  private ADMIN_USER = 'lanuevamolinera';
  private ADMIN_PASS = '123456'; // cámbiala si quieres
  isAdminLogged = false;

  constructor(private router: Router, public habitacionesService: RealtimeHabitacionesService) { }
  ngDoCheck(): void {
    this.isAdminLogged = localStorage.getItem('adminSession') === 'true';
  }
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
   onLogin(event: Event) {
    event.preventDefault();

    const emailInput = (document.getElementById('email') as HTMLInputElement);
    const passwordInput = (document.getElementById('password') as HTMLInputElement);

    const user = emailInput.value;
    const pass = passwordInput.value;

    if (user === this.ADMIN_USER && pass === this.ADMIN_PASS) {

      // ✅ Guardar sesión
      localStorage.setItem('adminSession', 'true');

      // ✅ Cerrar modal
      this.closeLoginForm();

      // ✅ Redirigir
      this.router.navigate(['/admin']); // crea esta ruta

    } else {
      this.showError('Credenciales incorrectas');
    }
  }

 logout() {
    localStorage.removeItem('adminSession');
    this.isAdminLogged = false;
    this.router.navigate(['/home']);
  }

  handleAdminAction(event: Event) {
    event.preventDefault();

    if (this.isAdminLogged) {
      this.logout();
    } else {
      this.openLoginForm();
    }
  }

  showError(message: string) {
    const msg = document.querySelector('.form-messages');
    if (msg) {
      msg.textContent = message;
      msg.classList.add('text-danger');
    }
  }
}
