import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearGroupChart } from './year-group-chart';

describe('YearGroupChart', () => {
  let component: YearGroupChart;
  let fixture: ComponentFixture<YearGroupChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearGroupChart],
    }).compileComponents();

    fixture = TestBed.createComponent(YearGroupChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
