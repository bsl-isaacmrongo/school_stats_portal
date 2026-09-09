import { Component, Input } from '@angular/core';
import { YearGroup } from '../../models/student.model';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-year-group-chart',
  styleUrl: './year-group-chart.css',
  templateUrl: './year-group-chart.html',
})
export class YearGroupChart {
   @Input() yearData!: YearGroup;
}
