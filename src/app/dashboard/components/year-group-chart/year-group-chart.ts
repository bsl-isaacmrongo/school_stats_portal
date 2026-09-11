import { Component, computed, inject, Input } from '@angular/core';
import { YearGroup } from '../../models/student.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// export interface YearGroupData {
//   year: string;
//   boys: number;
//   girls: number;
//   total: number;
//   stage?: string;
// }

export interface YearGroupData {
  yearGroupId?: string;
  year: string;
  boys: number;
  girls: number;
  total: number;
  stage?: string;
}


@Component({
  imports: [CommonModule],
  selector: 'app-year-group-chart',
  styleUrl: './year-group-chart.css',
  templateUrl: './year-group-chart.html',
})
export class YearGroupChart {

  // private router = inject(Router);

  // @Input({ required: true }) yearData!: YearGroupData;

  // boysPercent = computed(() =>
  //   this.yearData.total ? Math.round((this.yearData.boys / this.yearData.total) * 100) : 0
  // );

  // girlsPercent = computed(() =>
  //   this.yearData.total ? Math.round((this.yearData.girls / this.yearData.total) * 100) : 0
  // );

  // navigateToYearGroup(year: string){
  //   this.router.navigate(['/year-group', year]);
  // }

  private readonly router = inject(Router);

  @Input({ required: true }) yearData!: YearGroupData;

  readonly boysPercent = computed(() =>
    this.yearData.total ? Math.round((this.yearData.boys / this.yearData.total) * 100) : 0
  );

  readonly girlsPercent = computed(() =>
    this.yearData.total ? Math.round((this.yearData.girls / this.yearData.total) * 100) : 0
  );

  navigateToYearGroup(): void {
    const routeKey = this.yearData.yearGroupId ?? this.yearData.year;
    if (!routeKey) return;
    this.router.navigate(['/year-groups', routeKey]);
  }
}
