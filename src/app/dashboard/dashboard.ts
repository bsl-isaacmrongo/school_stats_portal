import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Pupil, StudentData } from './models/student.model';
import { StudentDataService } from './services/student.service';
import { AuthService } from '../auth/auth.service';
import { MetricCard } from "./components/metric-card/metric-card";
import { GenderChart } from "./components/gender-chart/gender-chart";
import { YearGroupChart } from "./components/year-group-chart/year-group-chart";
import { Loader } from './components/shared/loader/loader';

@Component({
  imports: [CommonModule, MetricCard, GenderChart, YearGroupChart, Loader],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private auth = inject(AuthService);
  private dataService = inject(StudentDataService);

  loading = this.dataService.pupilsLoading;
  data = computed<StudentData>(() => this.createDashboardData(this.dataService.pupils()));

  constructor() {
    this.dataService.getPupils().subscribe();
  }

  calculatePercentage(gender: 'boys' | 'girls'): number {
    const total = this.data().totalStudents;
    if (!total) return 0;
    const value = gender === 'boys' ? this.data().genderBreakdown.boys : this.data().genderBreakdown.girls;
    return Math.round((value / total) * 100);
  }

  private createDashboardData(pupils: Pupil[]): StudentData {
    const boys = pupils.filter(pupil => pupil.gender.toLowerCase() === 'male' || pupil.genderCode.toLowerCase() === 'm').length;
    const girls = pupils.filter(pupil => pupil.gender.toLowerCase() === 'female' || pupil.genderCode.toLowerCase() === 'f').length;
    const groups = new Map<string, { boys: number; girls: number }>();

    for (const pupil of pupils) {
      const group = groups.get(pupil.yearGroup) ?? { boys: 0, girls: 0 };
      if (pupil.gender.toLowerCase() === 'male' || pupil.genderCode.toLowerCase() === 'm') group.boys++;
      if (pupil.gender.toLowerCase() === 'female' || pupil.genderCode.toLowerCase() === 'f') group.girls++;
      groups.set(pupil.yearGroup, group);
    }

    return {
      totalStudents: pupils.length,
      genderBreakdown: { boys, girls },
      yearGroups: Array.from(groups, ([year, counts]) => ({ ...counts, year, total: counts.boys + counts.girls })),
      lastUpdated: new Date().toISOString(),
    };
  }

  logout(): void {
    this.auth.logout();
  }
}
