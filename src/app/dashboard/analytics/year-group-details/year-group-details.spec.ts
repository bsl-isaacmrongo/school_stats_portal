import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearGroupDetails } from './year-group-details';

describe('YearGroupDetails', () => {
  let component: YearGroupDetails;
  let fixture: ComponentFixture<YearGroupDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearGroupDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(YearGroupDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
