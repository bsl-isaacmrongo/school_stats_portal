import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, computed, ContentChildren, effect, input, output, QueryList, signal, TemplateRef } from '@angular/core';
import { TableColumn } from './table-column.mdel';
import { TableCellDirective } from './table-cell.directive';

export type PageItem = number | 'ellipsis';

@Component({
  imports: [CommonModule, NgTemplateOutlet],
  selector: 'app-table',
  styleUrl: './table.css',
  templateUrl: './table.html',
})
export class Table {
  data = input.required<unknown[]>();
  columns = input.required<TableColumn<unknown>[]>();
  pageSize = input(10);
  pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  page = input(1);
  totalItems = input<number | undefined>(undefined);
  pageChanged = output<number>();
  pageSizeChanged = output<number>();
  trackBy = input<(item: any) => unknown>((item) => item);
  emptyMessage = input('No records found.');
  siblingCount = input(1);

  @ContentChildren(TableCellDirective) cellTemplates!: QueryList<TableCellDirective<unknown>>;

  currentPage = signal(1);
  activePageSize = computed(() => this.pageSize());

  serverPagination = computed(() => this.totalItems() !== undefined);

  totalPages = computed(() => Math.max(1, Math.ceil(
    (this.totalItems() ?? this.data().length) / this.activePageSize()
  )));

  activePage = computed(() => this.serverPagination() ? this.page() : this.currentPage());

  paginatedData = computed(() => {
    if (this.serverPagination()) return this.data();
    const start = (this.currentPage() - 1) * this.activePageSize();
    return this.data().slice(start, start + this.activePageSize());
  });

  pageItems = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.activePage();
    const siblings = this.siblingCount();

    const totalSlots = siblings * 2 + 5;

    if (total <= totalSlots) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(current - siblings, 1);
    const rightSibling = Math.min(current + siblings, total);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < total - 1;

    const items: PageItem[] = [1];

    if (showLeftEllipsis) {
      items.push('ellipsis');
    } else {
      for (let p = 2; p < leftSibling; p++) items.push(p);
    }

    for (let p = leftSibling; p <= rightSibling; p++) {
      if (p !== 1 && p !== total) items.push(p);
    }

    if (showRightEllipsis) {
      items.push('ellipsis');
    } else {
      for (let p = rightSibling + 1; p < total; p++) items.push(p);
    }

    items.push(total);

    return items;
  });

  rangeStart = computed(() =>
    this.data().length === 0 ? 0 : (this.activePage() - 1) * this.activePageSize() + 1
  );

  rangeEnd = computed(() =>
    this.data().length === 0
      ? 0
      : this.rangeStart() + this.data().length - 1
  );

  constructor() {
    // Reset to page 1 whenever the incoming dataset changes (e.g. new search results)
    effect(() => {
      this.data();
      this.currentPage.set(1);
    });

  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.activePage()) return;
    if (this.serverPagination()) {
      this.pageChanged.emit(page);
      return;
    }
    this.currentPage.set(page);
  }
  nextPage() { this.goToPage(this.activePage() + 1); }
  prevPage() { this.goToPage(this.activePage() - 1); }

  onPageSizeChange(size: number) {
    if (size === this.activePageSize()) return;

    this.currentPage.set(1);
    this.pageSizeChanged.emit(size);

    // For server-paginated tables, the parent needs to know we're back on page 1
    if (this.serverPagination()) {
      this.pageChanged.emit(1);
    }
  }

  templateFor(key: string): TemplateRef<any> | null {
    return this.cellTemplates?.find(t => t.columnKey === key)?.templateRef ?? null;
  }

  cellValue(row: unknown, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }
}
