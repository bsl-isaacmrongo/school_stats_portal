import { Directive, ElementRef, output, HostListener } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  clickOutside = output<void>();

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
