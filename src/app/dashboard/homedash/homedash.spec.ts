import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Homedash } from './homedash';

describe('Homedash', () => {
  let component: Homedash;
  let fixture: ComponentFixture<Homedash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Homedash]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Homedash);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
