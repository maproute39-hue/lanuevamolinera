import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Servicescomponent } from './servicescomponent';

describe('Servicescomponent', () => {
  let component: Servicescomponent;
  let fixture: ComponentFixture<Servicescomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servicescomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Servicescomponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
