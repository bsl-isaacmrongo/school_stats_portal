import { Directive, Input, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[tableCell]',
  standalone: true,
})
export class TableCellDirective<T = any> {
  @Input('tableCell') columnKey!: string;
  templateRef = inject<TemplateRef<{ $implicit: T; row: T }>>(TemplateRef);
}
