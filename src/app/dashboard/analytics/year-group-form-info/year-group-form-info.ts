import { CommonModule, Location } from '@angular/common';
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
  ArrowLeft, Users, Mail, ChevronRight, ChevronLeft, ChevronDown,
  Search, LayoutGrid, List, School, UnfoldVertical, Share2, Download,
  UserPlus, Printer, Copy, Info, MapPin, Clock, ShieldCheck, SearchX,
  ClipboardCheck, BarChart3, SlidersHorizontal, CheckCheck, RotateCcw,
  Save, CheckCircle2, BookOpen, CalendarDays, MoreHorizontal,
} from 'lucide-angular';

import { StudentDataService } from '../../services/student.service';
import { YearGroupCacheService } from '../../services/year-group-cache.service';
import { Loader } from '../../shared/loader/loader';
import { Table } from '../../shared/table/table';
import { TableCellDirective } from '../../shared/table/table-cell.directive';
import { TableColumn } from '../../shared/table/table-column.mdel';
import { Pupil, PupilAttendance, YearGroupSubject } from '../../models/student.model';
import { FormGroup, YearGroupApiResponse, YearGroupDetail } from '../year-group-details/year-group-model';

import {
  AttendanceCode,
  AttendanceSummaryStat,
  AttendanceTab,
  StudentAttendanceRow,
} from './model';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-year-group-form-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Loader,
    LucideAngularModule,
    Table,
    TableCellDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './year-group-form-info.css',
  templateUrl: './year-group-form-info.html',
})
export class YearGroupFormInfo {
  private readonly service = inject(StudentDataService);
  private readonly cache = inject(YearGroupCacheService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly icons = {
    ArrowLeft, Users, Mail, ChevronRight, ChevronLeft, ChevronDown,
    Search, LayoutGrid, List, School, UnfoldVertical, Share2, Download,
    UserPlus, Printer, Copy, Info, MapPin, Clock, ShieldCheck, SearchX,
    ClipboardCheck, BarChart3, SlidersHorizontal, CheckCheck, RotateCcw,
    Save, CheckCircle2, BookOpen, CalendarDays, MoreHorizontal,
  };

  readonly yearGroupId = input('');
  readonly formId = input('');
  readonly schoolId = input('CL1-BGESS');

  readonly loading = signal(true);
  readonly yearGroups = signal<YearGroupDetail[]>([]);
  readonly students = signal<Pupil[]>([]);
  readonly yearGroupSubjects = signal<YearGroupSubject[]>([]);
  readonly attendanceRecords = signal<PupilAttendance[]>([]);
  readonly selectedPupilIds = signal<Set<string>>(new Set());
  readonly attendanceLoading = signal(false);
  readonly attendanceLoadError = signal(false);
  readonly selectedSubjectId = signal('');

  readonly activeTab = signal<AttendanceTab>('attendance');
  readonly actionsMenuOpen = signal(false);
  readonly searchQuery = signal('');
  readonly viewMode = signal<ViewMode>('list');
  readonly pageSize = signal(10);

  readonly selectedDateValue = signal(this.toDateInputValue(new Date()));
  readonly selectedDate = computed(() => this.formatSelectedDate(this.selectedDateValue()));
  readonly isToday = computed(() => this.selectedDateValue() === this.toDateInputValue(new Date()));
  readonly selectedPeriod = signal<string>('Period 2: (09:15 - 10:00) · CL1-157');


  readonly academicYears = this.buildAcademicYears();
  readonly selectedAcademicYear = signal(this.academicYears[0]);


  readonly attendanceCodes: AttendanceCode[] = [
    { code: 'CL1-1',   symbol: '/',  label: 'Present',                  colorClasses: 'bg-brandSecondary-50 border-brandSecondary-200 text-brandSecondary-800' },
    { code: 'CL1-100', symbol: 'ra', label: 'Religious Observance',     colorClasses: 'bg-brandSecondary-50 border-brandSecondary-200 text-brandSecondary-800' },
    { code: 'CL1-101', symbol: 'eo', label: 'Edu Activity (Off-site)',  colorClasses: 'bg-brandPrimary-50 border-brandPrimary-200 text-brandPrimary-800' },
    { code: 'CL1-102', symbol: 'sl', label: 'Study Leave',              colorClasses: 'bg-brandPrimary-50 border-brandPrimary-200 text-brandPrimary-800' },
    { code: 'CL1-103', symbol: 'oa', label: 'Sport Activity (On-site)', colorClasses: 'bg-brandPrimary-50 border-brandPrimary-200 text-brandPrimary-800' },
    { code: 'CL1-104', symbol: 'os', label: 'Sport Activity (Off-site)',colorClasses: 'bg-brandPrimary-50 border-brandPrimary-200 text-brandPrimary-800' },
  ];

  readonly customCodes = signal<AttendanceCode[]>([
    { code: 'CL1-1',   symbol: '/',  label: 'Present (CL1-1)',         description: 'Normal pupil classroom attendance.',      auth: true,  inSchool: true,  symbolClass: 'bg-brandSecondary-500/20 text-brandSecondary-300 border-brandSecondary-500/40' },
    { code: 'CL1-100', symbol: 'ra', label: 'Religious (CL1-100)',     description: 'Authorized faith-based absence.',         auth: false, inSchool: false, symbolClass: 'bg-brandSecondary-500/20 text-brandSecondary-300 border-brandSecondary-500/40' },
    { code: 'CL1-101', symbol: 'eo', label: 'Edu Offsite (CL1-101)',   description: 'Supervised field trip or museum visit.',  auth: true,  inSchool: true,  symbolClass: 'bg-brandPrimary-500/20 text-brandPrimary-200 border-brandPrimary-500/40' },
  ]);

  readonly tabs: { id: AttendanceTab; label: string; badge?: string }[] = [
    { id: 'attendance', label: 'Class Attendance Register', badge: 'CR-B' },
    { id: 'members',    label: 'Class Members',             badge: '8' },
  ];

  readonly detail = computed<YearGroupDetail | null>(() => {
    const id = this.yearGroupId();
    const groups = this.yearGroups();
    if (!groups.length) return null;
    return groups.find(g => g.id === id || g.year === id) ?? groups[0] ?? null;
  });

  readonly selectedForm = computed<FormGroup | null>(() => {
    const formId = this.normalizeKey(this.formId());
    if (!formId) return null;

    return this.detail()?.forms.find(form =>
      [form.id, form.code, form.name, form.formName]
        .some(value => this.normalizeKey(value) === formId)
    ) ?? null;
  });

  readonly subjectOptions = computed<YearGroupSubject[]>(() => {
    const subjects = new Map<string, YearGroupSubject>();
    for (const subject of this.relevantYearGroupSubjects()) {
      if (subject.isActive && subject.subject.subjectId && !subjects.has(subject.subject.subjectId)) {
        subjects.set(subject.subject.subjectId, subject);
      }
    }
    return [...subjects.values()].sort((a, b) => a.subject.name.localeCompare(b.subject.name));
  });

  readonly selectedSubject = computed(() =>
    this.subjectOptions().find(subject => subject.subject.subjectId === this.selectedSubjectId()) ?? null
  );

  readonly academicYearOptions = computed(() =>
    this.yearGroups().map(g => ({ value: g.id, label: g.year }))
  );

  readonly totalFormsLabel = computed(() =>
    (this.detail()?.totalForms ?? 0).toString().padStart(2, '0')
  );

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

  readonly attendanceRows = computed<StudentAttendanceRow[]>(() => {
    const group = this.detail();
    const form = this.selectedForm();
    if (!group) return [];

    const pupils = this.students().filter(p =>
      form
        ? this.studentBelongsToForm(p, group, form)
        : this.studentBelongsToYearGroup(p, group)
    );

    const attendanceByPupilId = new Map<string, PupilAttendance>();
    for (const record of this.attendanceRecords().filter(record =>
      record.subjectID === this.selectedSubjectId()
    )) {
      for (const key of this.attendanceKeys(record)) {
        attendanceByPupilId.set(key, record);
      }
    }
    return pupils.map(p => this.toAttendanceRow(p, this.attendanceForPupil(p, attendanceByPupilId)));
  });

  readonly filteredRows = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const rows = this.attendanceRows();

    console.log('Filtering rows with query:', q, 'Total rows:', rows);
    if (!q) return rows;
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.admNo.toLowerCase().includes(q)
    );
  });



  readonly summaryStats = computed<AttendanceSummaryStat[]>(() => {
    const rows = this.attendanceRows();
    const total = rows.length || 1;
    const present = rows.filter(r => r.attendanceCode === 'CL1-1').length;
    const activity = rows.filter(r => ['CL1-101', 'CL1-103', 'CL1-104'].includes(r.attendanceCode)).length;
    const absent = rows.filter(r => r.attendanceCode === 'CL1-100').length;

    return [
      { label: 'Present (In School):', count: present,  percent: `${((present / total) * 100).toFixed(1)}%`,  dotClass: 'bg-brandSecondary-500', wrapper: 'bg-brandSecondary-50/80 border-brandSecondary-100', labelClass: 'text-brandSecondary-800', valueClass: 'text-brandSecondary-700' },
      { label: 'Approved Activity:',   count: activity, percent: `${((activity / total) * 100).toFixed(1)}%`, dotClass: 'bg-brandPrimary-500',    wrapper: 'bg-brandPrimary-50/80 border-brandPrimary-100',       labelClass: 'text-brandPrimary-800',   valueClass: 'text-brandPrimary-700' },
      { label: 'Absent (Exempt/Rel):', count: absent,   percent: `${((absent / total) * 100).toFixed(1)}%`,   dotClass: 'bg-red-500',            wrapper: 'bg-red-50/80 border-red-100',                         labelClass: 'text-red-800',            valueClass: 'text-red-700' },
    ];
  });

  readonly rollCallLabel = computed(() => {
    const n = this.attendanceRows().length;
    return `${n} / ${n} Marked (100%)`;
  });

  readonly studentColumns: TableColumn<StudentAttendanceRow>[] = [
    // { key: 'select',     label: '', width: '36px' },
    { key: 'admNo',     label: 'Pupil ID & Adm No.' },
    { key: 'name',      label: 'Student Details' },
    { key: 'gender',    label: 'Gender' },
    { key: 'attendance', label: 'Attendance' },
    // { key: 'status',    label: 'In Attendance' },
    { key: 'authorised', label: 'Authorised' },
    { key: 'comment',   label: 'Comment' },
    // { key: 'actions',   label: '', width: '44px', align: 'center' },
  ];

  readonly trackByAdmissionNo = (student: Pupil) => student.admissionNo;
  readonly trackByStudentRow = (_: number, r: StudentAttendanceRow) => r.id;
  readonly trackByCode = (_: number, c: AttendanceCode) => c.code;
  readonly trackByTab = (_: number, tab: { id: AttendanceTab; label: string; badge?: string }) => tab.id;
  readonly trackByStudent = (student: StudentAttendanceRow) => student.id;

  constructor() {
    effect(() => {
      // Reset transient UI when active group changes
      void this.detail();
      // this.searchQuery.set('');
      // this.actionsMenuOpen.set(false);
      const options = this.subjectOptions();
      if (options.length && !options.some(subject => subject.subject.subjectId === this.selectedSubjectId())) {
        this.selectedSubjectId.set(options[0].subject.subjectId);
      }
    });
  }

  ngOnInit(): void {
    this.load();
    this.loadStudents();
    this.loadYearGroupSubjects();
    this.loadAttendance(this.selectedDateValue());
  }

  private load(): void {
    const cached = this.cache.read();
    if (cached?.length) {
      this.yearGroups.set(cached);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.service.getYearGroupDetails(this.schoolId()).subscribe({
      next: (response) => {
        const formatted = response
          .filter(this.isRealCohort)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(group => this.formatYearGroup(group));

        this.cache.write(formatted);
        this.yearGroups.set(formatted);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadAttendance(date: string): void {
    const school = this.schoolId();
    this.attendanceLoading.set(!this.service.hasCachedAttendance(school, date));
    this.attendanceLoadError.set(false);

    this.service.getPupilClassAttendance(school, date).subscribe({
      next: records => {
        // Form membership comes from the pupil store; attendance is joined by pupilId.
        if (date === this.selectedDateValue()) {
          this.attendanceRecords.set(records);
        }
      },
      error: () => {
        if (date === this.selectedDateValue()) {
          this.attendanceRecords.set([]);
          this.attendanceLoadError.set(true);
          this.attendanceLoading.set(false);
        }
      },
      complete: () => {
        if (date === this.selectedDateValue()) this.attendanceLoading.set(false);
      },
    });
  }

  private loadStudents(): void {
    this.service.getPupils(this.schoolId()).subscribe({
      next: pupils => this.students.set(pupils),
      error: () => this.students.set([]),
    });
  }

  private loadYearGroupSubjects(): void {
    this.service.getYearGroupSubjects(this.schoolCode()).subscribe({
      next: subjects => this.yearGroupSubjects.set(subjects),
      error: () => this.yearGroupSubjects.set([]),
    });
  }

  private schoolCode(): string {
    return this.schoolId()?.split('-')[0] || 'CL1-BGESS';
  }

  private relevantYearGroupSubjects(): YearGroupSubject[] {
    const subjects = this.yearGroupSubjects();
    const group = this.detail();
    if (!group) return subjects;
    const matches = subjects.filter(subject => this.normalizeKey(subject.yearGroup) === this.normalizeKey(group.id));
    return matches.length ? matches : subjects;
  }

  // ─── Filtering helpers (copied from YearGroupDetails) ───────────────
  private studentBelongsToForm(
    student: Pupil,
    group: YearGroupDetail,
    form: FormGroup,
  ): boolean {
    const matches = (value: string, candidates: string[]) => {
      const normalizedValue = this.normalizeKey(value);
      return Boolean(normalizedValue) && candidates.some(candidate =>
        normalizedValue === this.normalizeKey(candidate)
      );
    };

    return (
      (matches(student.yearGroupCode, [group.id]) || matches(student.yearGroup, [group.year])) &&
      (matches(student.formName, [form.formName, form.id, form.code, form.name]) ||
        matches(student.registrationGroupCode, [form.id, form.code, form.formName]) ||
        matches(student.registrationGroup, [form.id, form.code, form.formName, form.name]))
    );
  }

  private studentBelongsToYearGroup(student: Pupil, group: YearGroupDetail): boolean {
    const matches = (value: string, candidates: string[]) => {
      const normalizedValue = this.normalizeKey(value);
      return Boolean(normalizedValue) && candidates.some(candidate =>
        normalizedValue === this.normalizeKey(candidate)
      );
    };

    return (
      matches(student.yearGroupCode, [group.id]) ||
      matches(student.yearGroup, [group.year])
    );
  }

  private normalizeKey(value: string): string {
    return value?.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private isGender(student: Pupil, gender: 'boys' | 'girls'): boolean {
    const values = [student.gender, student.genderCode]
      .map(value => value?.trim().toLowerCase());
    return gender === 'boys'
      ? values.some(value => value === 'male' || value === 'm')
      : values.some(value => value === 'female' || value === 'f');
  }

  private readonly isActiveForm = (form: YearGroupApiResponse['forms'][number]): boolean => {
    const tutorId = String(form?.tutorId ?? '').trim();
    const formId = String(form?.formId ?? '').trim();
    const description = String(form?.description ?? '').trim();
    return Boolean(tutorId) && Boolean(formId || description);
  };

  private readonly isRealCohort = (g: YearGroupApiResponse): boolean => {
    const activeForms = (g.forms ?? []).filter(this.isActiveForm);
    return g.ageGroup > 0 && activeForms.length > 0;
  };

  private toAttendanceRow(p: Pupil, record?: PupilAttendance): StudentAttendanceRow {
    const gender = this.isGender(p, 'boys') ? 'Male' : 'Female';
    const initials = this.getInitials(p.name);
    const raw = p as Record<string, unknown>;
    const attendanceCode = this.attendanceCodeFor(record);
    const attendanceMeta = this.attendanceCodes.find(c => c.code === attendanceCode) ?? {
      code: attendanceCode,
      symbol: record?.attendanceSymbol || attendanceCode,
      label: record?.absenceType || 'Not recorded',
    };
    const attendanceType = record?.absenceType?.trim() || 'Not recorded';
    const normalizedAttendanceType = attendanceType.toLowerCase();
    const isOffSite = record?.isInAttendance === true &&
      (normalizedAttendanceType.includes('off-site') || normalizedAttendanceType.includes('off site'));
    const isAbsent = record?.isInAttendance === false;

    return {
      id: String(raw['studentId'] ?? raw['pupilId'] ?? p.admissionNo),
      admNo: p.admissionNo,
      name: p.name,
      guardian: String(raw['guardianName'] ?? '—'),
      initials,
      gender,
      avatarClasses: gender === 'Female'
        ? 'bg-brandSecondary-50 text-brandSecondary-700 ring-brandSecondary-200'
        : 'bg-brandPrimary-50 text-brandPrimary-700 ring-brandPrimary-200',
      attendanceSymbol: record?.attendanceSymbol?.trim() || attendanceMeta.symbol,
      attendanceType,
      attendanceLabel: attendanceMeta.label,
      attendanceCode: attendanceMeta.code,
      attendanceBadgeClasses: this.badgeForCode(attendanceMeta.code),
      inAttendance: isAbsent ? 'No' : isOffSite ? 'Yes (Off-site)' : 'Yes',
      authorised: record ? (record.isAuthorised ? 'Authorised' : 'Unauthorised') : 'Not recorded',
      comment: record?.comments ?? '',
    };
  }

  private attendanceForPupil(
    pupil: Pupil,
    attendanceByPupilId: Map<string, PupilAttendance>,
  ): PupilAttendance | undefined {
    const raw = pupil as Record<string, unknown>;
    const pupilKeys = [
      pupil.pupilId,
      raw['studentId'],
      pupil.admissionNo,
      pupil.pupilCode,
      raw['id'],
    ]
      .map(value => String(value ?? '').trim())
      .filter(Boolean);

    return pupilKeys
      .map(key => attendanceByPupilId.get(key))
      .find((record): record is PupilAttendance => Boolean(record));
  }

  private attendanceKeys(record: PupilAttendance): string[] {
    const raw = record as Record<string, unknown>;
    return [raw['pupilId'], raw['studentId'], raw['id']]
      .map(value => String(value ?? '').trim())
      .filter(Boolean);
  }

  private attendanceCodeFor(record?: PupilAttendance): string {
    if (!record) return 'Not recorded';
    const absenceType = record.absenceType?.trim() ?? '';
    if (absenceType.toLowerCase() === 'present' || record.attendanceSymbol === '/') return 'CL1-1';
    const type = absenceType.toLowerCase();
    if (type.includes('religious')) return 'CL1-100';
    if (type.includes('education') || type.includes('edu ')) return 'CL1-101';
    if (type.includes('off-site') || type.includes('off site')) return 'CL1-104';
    if (type.includes('on-site') || type.includes('on site')) return 'CL1-103';
    return String(record['attendanceCode'] ?? record.absenceType);
  }

  private badgeForCode(code: string): string {
    switch (code) {
      case 'CL1-1':   return 'bg-brandSecondary-500 text-white';
      case 'CL1-100': return 'bg-brandSecondary-400 text-white';
      case 'CL1-101': return 'bg-brandPrimary-500 text-white';
      case 'CL1-103': return 'bg-brandPrimary-400 text-white';
      case 'CL1-104': return 'bg-brandPrimary-600 text-white';
      default:        return 'bg-neutralSlate-500 text-white';
    }
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

  private formatYearGroup(group: YearGroupApiResponse): YearGroupDetail {
    const forms = (group.forms ?? [])
      .filter(this.isActiveForm)
      .map(form => this.formatForm(form))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

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
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

    const hasTutor = Boolean(form.tutorId);
    const raw = form as unknown as Record<string, unknown>;
    const formName = String(raw['formName'] ?? form.description).trim();
    const enrolled = Number(raw['enrolled'] ?? raw['totalEnrolled'] ?? 0);
    const boys = Number(raw['boys'] ?? raw['maleCount'] ?? 0);
    const girls = Number(raw['girls'] ?? raw['femaleCount'] ?? 0);
    const attendance = Number(raw['attendance'] ?? 0);

    return {
      id: form.formId,
      code: form.formId,
      formName,
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
        email: '',
        room: '',
        roomIcon: 'meeting_room',
        isActive: hasTutor,
      },
    };
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

  // ─── UI actions (mirrors YearGroupDetails) ──────────────────────────
  setActiveTab(id: AttendanceTab): void { this.activeTab.set(id); }
  toggleActionsMenu(): void              { this.actionsMenuOpen.update(v => !v); }
  closeActionsMenu(): void               { this.actionsMenuOpen.set(false); }
  onSearchInput(value: string): void     { this.searchQuery.set(value); }
  onSubjectChange(subjectId: string): void { this.selectedSubjectId.set(subjectId); }
  clearFilter(): void                    { this.searchQuery.set(''); }
  setViewMode(mode: ViewMode): void      { this.viewMode.set(mode); }

  changePageSize(pageSize: number): void {
    if (pageSize > 0) this.pageSize.set(pageSize);
  }

  isPupilSelected(id: string): boolean { return this.selectedPupilIds().has(id); }

  togglePupilSelection(id: string, selected: boolean): void {
    this.selectedPupilIds.update(ids => {
      const next = new Set(ids);
      selected ? next.add(id) : next.delete(id);
      return next;
    });
  }

  onDateChange(value: string): void {
    if (value) this.selectAttendanceDate(value);
  }

  changeDate(days: number): void {
    const date = new Date(`${this.selectedDateValue()}T12:00:00`);
    date.setDate(date.getDate() + days);
    this.selectAttendanceDate(this.toDateInputValue(date));
  }

  private selectAttendanceDate(date: string): void {
    if (date === this.selectedDateValue()) return;
    this.selectedDateValue.set(date);
    this.loadAttendance(date);
  }

  onYearGroupChange(id: string): void {
    if (!id) return;
    this.router.navigate(['/year-group', id, 'info']);
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
      return;
    }

    void this.router.navigate(['/dashboard']);
  }

  async copyYearGroupId(): Promise<void> {
    const id = this.detail()?.id;
    if (id && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(id);
    }
  }

  markAllPresent(): void  { /* TODO: call attendance service */ }
  quickReset(): void      { /* TODO */ }
  saveAndSubmit(): void   { /* TODO */ }
  printRegister(): void   { /* window.print() or service */ }
  lockAndFinalize(): void { /* TODO */ }
  defineNewCode(): void   { /* TODO */ }
  configureCustomCodes(): void { /* TODO */ }

  private formatSelectedDate(value: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
    }).format(new Date(`${value}T12:00:00`));
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  refresh(): void {
    this.cache.clear();
    this.yearGroups.set([]);
    this.load();
  }
}
