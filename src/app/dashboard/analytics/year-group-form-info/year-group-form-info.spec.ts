import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearGroupFormInfo } from './year-group-form-info';

describe('YearGroupFormInfo', () => {
  let component: YearGroupFormInfo;
  let fixture: ComponentFixture<YearGroupFormInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearGroupFormInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(YearGroupFormInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
