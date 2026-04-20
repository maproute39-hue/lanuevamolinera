import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {
tourBooking = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

readonly whatsappNumber = '584147015219';

ngOnInit(): void {
  window.scrollTo(0, 0);
}
sendTourWhatsapp(): void {
  if (!this.tourBooking.name || !this.tourBooking.subject) {
    return;
  }

  const text = this.buildTourWhatsappMessage();
  const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

buildTourWhatsappMessage(): string {
  return `Hola, me gustaría recibir información sobre La Nueva Molinera.

*Nombre:* ${this.tourBooking.name}
*Correo:* ${this.tourBooking.email || 'No indicado'}
*Consulta sobre:* ${this.tourBooking.subject}
*Mensaje:* ${this.tourBooking.message || 'Sin mensaje adicional'}`;
}
}
