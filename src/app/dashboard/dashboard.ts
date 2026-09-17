import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicYearStats, Pupil, StudentData } from './models/student.model';
import { StudentDataService } from './services/student.service';
import { AuthService } from '../auth/auth.service';
import { MetricCard } from './analytics/metric-card/metric-card';
import { YearGroupCard } from './analytics/year-group-card/year-group-card';
import { Loader } from './shared/loader/loader';

@Component({
  imports: [CommonModule, FormsModule, YearGroupCard, Loader],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private auth = inject(AuthService);
  private dataService = inject(StudentDataService);

  loading = computed(() => this.dataService.pupilsLoading() || this.dataService.leaversLoading());
  data = computed<StudentData>(() => this.createDashboardData(this.dataService.pupils()));
  academicYears = this.createAcademicYears();
  selectedAcademicYear = signal(this.academicYears[0]);
  movementStats = computed<AcademicYearStats>(() =>
    this.createMovementStats(this.dataService.pupils(), this.dataService.leavers(), this.selectedAcademicYear())
  );

  // New computed signals for the movement panel
  totalMovement = computed(() => {
    const stats = this.movementStats();
    return stats.joiners + stats.leavers;
  });

  joinerPercentage = computed(() => {
    const total = this.totalMovement();
    return total ? Number(((this.movementStats().joiners / total) * 100).toFixed(2)) : 0;
  });

  leaverPercentage = computed(() => {
    const total = this.totalMovement();
    return total ? Number(((this.movementStats().leavers / total) * 100).toFixed(2)) : 0;
  });

  netIntake = computed(() => {
    const stats = this.movementStats();
    return stats.joiners - stats.leavers;
  });

  netGrowthPercent = computed(() => {
    const base = this.data().totalStudents - this.netIntake();
    if (!base) return 0;
    const percent = (this.netIntake() / base) * 100;
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}`;
  });

  constructor() {
    this.dataService.getPupils().subscribe();
    this.dataService.getLeavers().subscribe();
  }

  calculatePercentage(gender: 'boys' | 'girls'): number {
    const total = this.data().totalStudents;
    if (!total) return 0;
    const value = gender === 'boys' ? this.data().genderBreakdown.boys : this.data().genderBreakdown.girls;
    return Number(((value / total) * 100).toFixed(2));
  }

  selectAcademicYear(year: string): void {
    this.selectedAcademicYear.set(year);
  }

  private createAcademicYears(): string[] {
    const currentAcademicYearStart = new Date().getMonth() >= 7
      ? new Date().getFullYear()
      : new Date().getFullYear() - 1;

    return Array.from({ length: 4 }, (_, index) => {
      const startYear = currentAcademicYearStart - index;
      return `${startYear}/${String(startYear + 1).slice(-2)}`;
    });
  }

  private createMovementStats(pupils: Pupil[], leavers: Pupil[], academicYear: string): AcademicYearStats {
    const startYear = Number(academicYear.slice(0, 4));
    const yearStart = new Date(startYear, 7, 1);
    const yearEnd = new Date(startYear + 1, 7, 1);
    let joiners = 0;

    for (const pupil of pupils) {
      const entryDate = this.parseDate(pupil.dateOfEntry);

      if (entryDate && this.isInAcademicYear(entryDate, yearStart, yearEnd)) {
        joiners++;
      }
    }

    const leaverCount = leavers.filter(pupil => {
      const leavingDate = this.parseDate(pupil.dateOfLeaving);
      return leavingDate !== undefined && this.isInAcademicYear(leavingDate, yearStart, yearEnd);
    }).length;

    return { joiners, leavers: leaverCount };
  }

  private isInAcademicYear(date: Date, yearStart: Date, yearEnd: Date): boolean {
    return date >= yearStart && date < yearEnd;
  }

  private parseDate(value: string): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

private readonly yearGroupOrder: readonly string[] = [
  'Crèche',
  'Foundation Stage 1',
  'Foundation Stage 2',
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Year 5',
  'Year 6',
  'Year 7',
  'Year 8',
  'Year 9',
  'Year 10',
  'Year 11',
  'Year 12',
  'Year 13',
];

private readonly stageMap: Readonly<Record<string, string>> = {
  'Crèche': 'Early Years Infants',
  'Foundation Stage 1': 'Nursery',
  'Foundation Stage 2': 'Reception',
  'Year 1': 'Key Stage 1 Entry',
  'Year 2': 'Key Stage 1',
  'Year 3': 'Key Stage 2 Entry',
  'Year 4': 'Primary Stage',
  'Year 5': 'Primary Stage',
  'Year 6': 'Primary Graduation',
  'Year 7': 'Secondary Entry',
  'Year 8': 'Middle School',
  'Year 9': 'Middle School Senior',
  'Year 10': 'IGCSE Stage',
  'Year 11': 'Final Exam Cohort',
  'Year 12': 'Sixth Form Junior',
  'Year 13': 'Sixth Form Senior',
};

private createDashboardData(pupils: Pupil[]): StudentData {
  const isBoy = (pupil: Pupil): boolean =>
    pupil.gender?.toLowerCase() === 'male' ||
    pupil.genderCode?.toLowerCase() === 'm';

  const isGirl = (pupil: Pupil): boolean =>
    pupil.gender?.toLowerCase() === 'female' ||
    pupil.genderCode?.toLowerCase() === 'f';

  let boys = 0;
  let girls = 0;
  const groups = new Map<string, { boys: number; girls: number }>();

  for (const pupil of pupils) {
    const group = groups.get(pupil.yearGroup) ?? { boys: 0, girls: 0 };

    if (isBoy(pupil)) {
      boys++;
      group.boys++;
    } else if (isGirl(pupil)) {
      girls++;
      group.girls++;
    }

    groups.set(pupil.yearGroup, group);
  }

  // Sort year groups into proper academic progression order
  const sortedYearGroups = Array.from(groups, ([year, counts]) => ({
    ...counts,
    year,
    total: counts.boys + counts.girls,
    stage: this.stageMap[year] ?? 'Academic Cohort',
  })).sort((a, b) => {
    const aIndex = this.yearGroupOrder.indexOf(a.year);
    const bIndex = this.yearGroupOrder.indexOf(b.year);

    // Unknown year groups go to the end, sorted alphabetically
    if (aIndex === -1 && bIndex === -1) return a.year.localeCompare(b.year);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return {
    totalStudents: pupils.length,
    genderBreakdown: { boys, girls },
    yearGroups: sortedYearGroups,
    lastUpdated: new Date().toISOString(),
  };
}

  logout(): void {
    this.auth.logout();
  }
}
