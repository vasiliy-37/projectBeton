import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWorks } from './admin-works';

describe('AdminWorks', () => {
  let component: AdminWorks;
  let fixture: ComponentFixture<AdminWorks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminWorks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminWorks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
