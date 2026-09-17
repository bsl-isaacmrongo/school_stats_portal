import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenderChart } from './gender-chart';

describe('GenderChart', () => {
  let component: GenderChart;
  let fixture: ComponentFixture<GenderChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenderChart],
    }).compileComponents();

    fixture = TestBed.createComponent(GenderChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
