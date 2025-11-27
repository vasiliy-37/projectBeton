import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandList } from './brand-list';

describe('BrandList', () => {
  let component: BrandList;
  let fixture: ComponentFixture<BrandList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
