import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPrice } from './admin-price';

describe('AdminPrice', () => {
  let component: AdminPrice;
  let fixture: ComponentFixture<AdminPrice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPrice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPrice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
