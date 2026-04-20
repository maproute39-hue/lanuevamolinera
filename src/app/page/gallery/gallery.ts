import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit {
  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

}
