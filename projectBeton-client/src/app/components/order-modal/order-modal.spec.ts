import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderModal } from './order-modal';

describe('OrderModal', () => {
  let component: OrderModal;
  let fixture: ComponentFixture<OrderModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
