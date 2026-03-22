import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminChats } from './admin-chats';

describe('AdminChats', () => {
  let component: AdminChats;
  let fixture: ComponentFixture<AdminChats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminChats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminChats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
