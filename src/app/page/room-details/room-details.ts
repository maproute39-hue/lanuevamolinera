import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { RealtimeHabitacionesService } from '../../services/habitaciones-realtime.service';
import { Habitacion } from '../../models/habitacion.model';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-details.html',
  styleUrl: './room-details.scss',
})
export class RoomDetails implements OnInit {
  isBrowser: boolean = false;

  habitacion$: Observable<Habitacion | null>;

  private habitacionSubject = new BehaviorSubject<Habitacion | null>(null);

  constructor(
    private route: ActivatedRoute,
    private habitacionesService: RealtimeHabitacionesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.habitacion$ = this.habitacionSubject.asObservable();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      console.log('ID from route:', id);
      if (id) {
        this.habitacionesService.getHabitacionById(id).then(habitacion => {
          console.log('Habitacion loaded:', habitacion);
          this.habitacionSubject.next(habitacion);
        }).catch(error => {
          console.error('Error loading habitacion:', error);
          this.habitacionSubject.next(null);
        });
      }
    });
     if (!this.isBrowser) return;

      window.scrollTo(0, 0);
  }

  ngAfterViewInit(): void {
      if (!this.isBrowser) return;

    window.scrollTo(0, 0);
  }
}
