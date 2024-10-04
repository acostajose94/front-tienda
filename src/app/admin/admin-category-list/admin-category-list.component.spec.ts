import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCategoryListComponent } from './admin-category-list.component';

describe('AdminCategoryListComponent', () => {
  let component: AdminCategoryListComponent;
  let fixture: ComponentFixture<AdminCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
