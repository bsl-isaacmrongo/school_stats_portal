import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, input, Input, signal } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  imports: [CommonModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  pageTitle = input('📊 Dashboard');
  pageSubtitle = input('Student demographic overview');
  lastUpdated = input<Date>(new Date());
  userName = input('Admin');
  userInitials = input('AD');

  dropdownOpen = signal(false);

  constructor(private elementRef: ElementRef, private router: Router) {}

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.dropdownOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }

  logout() {
    this.dropdownOpen.set(false);
    // your logout logic
    this.router.navigate(['/login']);
  }
}
