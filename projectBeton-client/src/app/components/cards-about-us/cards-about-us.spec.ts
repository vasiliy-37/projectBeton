import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsAboutUs } from './cards-about-us';

describe('CardsAboutUs', () => {
  let component: CardsAboutUs;
  let fixture: ComponentFixture<CardsAboutUs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsAboutUs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsAboutUs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
