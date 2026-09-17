import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearGroupCard } from './year-group-card';

describe('YearGroupChart', () => {
  let component: YearGroupCard;
  let fixture: ComponentFixture<YearGroupCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearGroupCard],
    }).compileComponents();

    fixture = TestBed.createComponent(YearGroupCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
