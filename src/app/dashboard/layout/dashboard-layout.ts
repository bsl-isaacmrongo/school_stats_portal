import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Footer } from '../components/shared/footer/footer';
import { Header } from '../components/shared/header/header';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Header, Footer],
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  currentYear = new Date().getFullYear();
}
