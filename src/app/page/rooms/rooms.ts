import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.scss',
})
export class Rooms {
constructor( public RealtimeHabitacionesService: RealtimeHabitacionesService, public router: Router) {
}
 viewHabitacion(id: string) {
    this.router.navigate(['/room-details', id]);
  }
}
