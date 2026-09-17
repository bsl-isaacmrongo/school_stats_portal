import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableColumn } from '../shared/table/table-column.mdel';
import { Table } from "../shared/table/table";
import { TableCellDirective } from '../shared/table/table-cell.directive';
import { Pupil } from '../models/student.model';
import { StudentDataService } from '../services/student.service';
import { Loader } from "../shared/loader/loader";
import { ToastrService } from 'ngx-toastr';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Table, TableCellDirective, Loader, ],
  selector: 'app-students',
  styleUrl: './students.css',
  templateUrl: './students.html',
})
export class Students {
  private studentDataService = inject(StudentDataService);

  students = signal<Pupil[]>([]);
  loading = signal(true);
  loadError = signal('');
  toastr = inject(ToastrService);

  searchTerm = signal('');
  pageSize = signal(25);
  page = signal(1);
  totalCount = signal(0);

  filteredStudents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.students();
    return this.students().filter(s =>
      s.name.toLowerCase().includes(term) || s.admissionNo.toLowerCase().includes(term)
    );
  });

  pagedStudents = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredStudents().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredStudents().length / this.pageSize()))
  );

  columns: TableColumn<Pupil>[] = [
    { key: 'admissionNo', label: 'Admission No.' },
    { key: 'name', label: 'Name' },
    { key: 'yearGroup', label: 'Year Group' },
    { key: 'gender', label: 'Gender' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  trackByAdmissionNo = (s: Pupil) => s.admissionNo;

  constructor(private router: Router) {
    this.loadPage();
  }

  loadPage(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.studentDataService.getPupils().subscribe({
      next: pupils => {
        this.students.set(pupils);
        this.totalCount.set(pupils.length);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Unable to load pupil data.');
        this.loading.set(false);
      },
    });
  }

  changePage(page: number): void {
    if (page === this.page() || page < 1 || page > this.totalPages()) return;
    this.page.set(page);
  }

  changePageSize(pageSize: number): void {
    if (pageSize === this.pageSize()) return;
    this.pageSize.set(pageSize);
    this.page.set(1);
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
    this.page.set(1);
  }

  viewStudent(student: Pupil) {
    this.toastr.info("Work in progress: Viewing student details is not yet implemented.", "Info");
    // this.router.navigate(['/students', student.admissionNo]);
  }
}
