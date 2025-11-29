import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneDisplay } from './phone-display';

describe('PhoneDisplay', () => {
  let component: PhoneDisplay;
  let fixture: ComponentFixture<PhoneDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhoneDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
