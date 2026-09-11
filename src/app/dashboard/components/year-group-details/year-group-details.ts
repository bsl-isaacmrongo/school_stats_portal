// year-group-details/year-group-details.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeft, Users, Mail, ChevronRight, Search, LayoutGrid, List,
  School, UnfoldVertical, Share2, ChevronDown, Download, UserPlus,
  Printer, Copy, Info, MapPin, Clock, ShieldCheck, SearchX,
} from 'lucide-angular';
import {
  FormGroup,
  YearGroupApiResponse,
  YearGroupDetail,
} from './year-group-model';
import { StudentDataService } from '../../services/student.service';
import { YearGroupCacheService } from '../../services/year-group-cache.service';
import { Loader } from '../shared/loader/loader';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-year-group-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Loader, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './year-group-details.css',
  templateUrl: './year-group-details.html',
})
export class YearGroupDetails {
  private readonly service = inject(StudentDataService);
  private readonly cache = inject(YearGroupCacheService);
  private readonly router = inject(Router);

  readonly icons = {
    ArrowLeft, Users, Mail, ChevronRight, Search, LayoutGrid, List,
    School, UnfoldVertical, Share2, ChevronDown, Download, UserPlus,
    Printer, Copy, Info, MapPin, Clock, ShieldCheck, SearchX,
  };

  /** Route param: `:yearGroupId` (e.g. "004" for Year 10) */
  readonly yearGroupId = input('');

  readonly schoolId = input('CL1-BGESS');

  readonly loading = signal(true);
  readonly yearGroups = signal<YearGroupDetail[]>([]);

  /**
   * The currently active year group, resolved from the route param.
   * Null while loading or if the id isn't present in the dataset.
   */
  readonly detail = computed<YearGroupDetail | null>(() => {
    const id = this.yearGroupId();
    const groups = this.yearGroups();
    if (!groups.length) return null;
    return groups.find(group => group.id === id || group.year === id) ?? groups[0] ?? null;
  });

  readonly searchQuery = signal('');
  readonly viewMode = signal<ViewMode>('grid');
  readonly actionsMenuOpen = signal(false);

  readonly academicYears = this.buildAcademicYears();
  readonly selectedAcademicYear = signal(this.academicYears[0]);

  /** Options for the year-group dropdown — excludes non-cohort groups. */
  readonly academicYearOptions = computed(() =>
    this.yearGroups().map(group => ({
      value: group.id,
      label: group.year,
    }))
  );

  readonly filteredForms = computed<FormGroup[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const forms = this.detail()?.forms ?? [];
    if (!query) return forms;

    return forms.filter(form =>
      form.id.toLowerCase().includes(query) ||
      form.name.toLowerCase().includes(query) ||
      form.tutor.fullName.toLowerCase().includes(query) ||
      form.tutor.id.toLowerCase().includes(query)
    );
  });

  readonly hasActiveFilter = computed(() => this.searchQuery().trim().length > 0);

  readonly boysPercent = computed(() => {
    const d = this.detail();
    if (!d?.totalEnrolled) return 0;
    return Math.round((d.boys / d.totalEnrolled) * 1000) / 10;
  });

  readonly girlsPercent = computed(() => {
    const d = this.detail();
    if (!d?.totalEnrolled) return 0;
    return Math.round((d.girls / d.totalEnrolled) * 1000) / 10;
  });

  readonly capacityPercent = computed(() => {
    const d = this.detail();
    if (!d?.capacity) return 0;
    return Math.round((d.totalEnrolled / d.capacity) * 1000) / 10;
  });

  readonly totalFormsLabel = computed(() =>
    (this.detail()?.totalForms ?? 0).toString().padStart(2, '0')
  );

  constructor() {
    // Whenever the route param changes AND data is available, the
    // computed `detail` updates automatically. We only need an effect
    // here to keep the search box from carrying over stale queries.
    effect(() => {
      // Trigger reset when the active group changes
      void this.detail();
      // (Uncomment if you want to reset search on group switch)
      // this.searchQuery.set('');
      // this.actionsMenuOpen.set(false);
    });
  }

  ngOnInit(): void {
    this.load();
  }

  // ─── Data loading ───────────────────────────────────────────────────

  private load(): void {
    // 1. Check session cache
    const cached = this.cache.read();
    if (cached?.length) {
      this.yearGroups.set(cached);
      this.loading.set(false);
      return;
    }

    // 2. Cache miss → fetch
    this.loading.set(true);
    this.service.getYearGroupDetails(this.schoolId()).subscribe({
      next: (response) => {
        const formatted = response
          .filter(this.isRealCohort)           // drop Activities / Staff
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(group => this.formatYearGroup(group));

        this.cache.write(formatted);
        this.yearGroups.set(formatted);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  /** Activities and Staff have no age/forms and aren't real cohorts. */
  private readonly isRealCohort = (g: YearGroupApiResponse): boolean =>
    g.ageGroup > 0 && g.forms.length > 0;

  // ─── UI actions ─────────────────────────────────────────────────────

  onYearGroupChange(id: string): void {
    if (!id) return;
    // Navigate — route param drives the active detail via `effect`
    this.router.navigate(['/year-groups', id]);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  clearFilter(): void {
    this.searchQuery.set('');
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  toggleActionsMenu(): void {
    this.actionsMenuOpen.update(v => !v);
  }

  closeActionsMenu(): void {
    this.actionsMenuOpen.set(false);
  }

  async copyYearGroupId(): Promise<void> {
    const id = this.detail()?.id;
    if (id && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(id);
    }
  }

  percentage(value: number, total: number): number {
    return total ? Math.round((value / total) * 100) : 0;
  }

  /** Force a fresh fetch (e.g. after mutations). */
  refresh(): void {
    this.cache.clear();
    this.yearGroups.set([]);
    this.load();
  }

  // ─── Data mapping ───────────────────────────────────────────────────

  private formatYearGroup(group: YearGroupApiResponse): YearGroupDetail {
    const forms = group.forms
      .map(form => this.formatForm(form))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    // If your API ever returns per-form counts (boys/girls/enrolled),
    // these aggregates will be accurate. Otherwise they fall back to 0.
    const totalEnrolled = forms.reduce((sum, f) => sum + f.enrolled, 0);
    const boys = forms.reduce((sum, f) => sum + f.boys, 0);
    const girls = forms.reduce((sum, f) => sum + f.girls, 0);

    return {
      id: group.yearGroupId,
      year: group.description,
      sortOrder: group.sortOrder,
      ageGroup: group.ageGroup,
      ageRange: group.ageGroup
        ? `${group.ageGroup} - ${group.ageGroup + 1} Yrs`
        : 'Not specified',
      curriculum: this.resolveCurriculum(group.ageGroup),
      headOfYear: 'Not specified',
      location: 'Not specified',
      assembly: 'Not specified',
      capacity: 0,
      totalForms: forms.length,
      totalEnrolled,
      boys,
      girls,
      formsWithTutor: forms.filter(f => f.tutor.isActive).length,
      totalFormTutors: forms.length,
      curriculumTier: this.resolveCurriculumTier(group.ageGroup),
      averageAttendance: 0,
      activeInterventions: 0,
      forms,
    };
  }

  private formatForm(form: YearGroupApiResponse['forms'][number]): FormGroup {
    const fullName = [
      form.tutorTitle,
      form.tutorForename,
      form.tutorPreferredForeName,
      form.tutorSurname,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const hasTutor = Boolean(form.tutorId);

    // The provided payload doesn't include counts; wire these up
    // if/when the API is extended.
    const raw = form as unknown as Record<string, unknown>;
    const enrolled = Number(raw['enrolled'] ?? raw['totalEnrolled'] ?? 0);
    const boys = Number(raw['boys'] ?? raw['maleCount'] ?? 0);
    const girls = Number(raw['girls'] ?? raw['femaleCount'] ?? 0);
    const attendance = Number(raw['attendance'] ?? 0);

    return {
      id: form.formId,
      code: form.formId,
      name: form.description,
      track: 'Form group',
      trackVariant: 'neutral',
      enrolled,
      boys,
      girls,
      attendance,
      tutor: {
        id: hasTutor ? (form.tutorId ?? '') : '',
        initials: hasTutor ? this.getInitials(fullName) : '—',
        fullName: hasTutor ? fullName : 'No tutor assigned',
        email: '',                    // ← API doesn't provide; fill if extended
        room: '',                     // ← API doesn't provide
        roomIcon: 'meeting_room',
        isActive: hasTutor,
      },
    };
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  private resolveCurriculum(ageGroup: number): string {
    if (ageGroup <= 2) return 'Early Years Foundation Stage';
    if (ageGroup <= 4) return 'EYFS Reception / Nursery';
    if (ageGroup <= 6) return 'Key Stage 1 Curriculum';
    if (ageGroup <= 10) return 'Key Stage 2 Curriculum';
    if (ageGroup <= 13) return 'Key Stage 3 Curriculum';
    if (ageGroup <= 15) return 'Key Stage 4 IGCSE Curriculum';
    return 'IB Diploma / A-Level Programme';
  }

  private resolveCurriculumTier(ageGroup: number): string {
    if (ageGroup <= 2) return 'EYFS';
    if (ageGroup <= 4) return 'EYFS';
    if (ageGroup <= 6) return 'KS1';
    if (ageGroup <= 10) return 'KS2';
    if (ageGroup <= 13) return 'KS3';
    if (ageGroup <= 15) return 'KS4 IGCSE';
    return 'KS5 IB / A-Level';
  }

  private buildAcademicYears(): string[] {
    const currentAcademicYearStart =
      new Date().getMonth() >= 7
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;

    return Array.from({ length: 4 }, (_, index) => {
      const startYear = currentAcademicYearStart - index;
      return `${startYear}/${String(startYear + 1).slice(-2)}`;
    });
  }
}
