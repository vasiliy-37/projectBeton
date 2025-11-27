import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderButton } from './order-button';

describe('OrderButton', () => {
  let component: OrderButton;
  let fixture: ComponentFixture<OrderButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
