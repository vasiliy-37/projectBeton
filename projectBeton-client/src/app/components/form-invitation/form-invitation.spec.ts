import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInvitation } from './form-invitation';

describe('FormInvitation', () => {
  let component: FormInvitation;
  let fixture: ComponentFixture<FormInvitation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInvitation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInvitation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
