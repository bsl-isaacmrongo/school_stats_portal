import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-metric-card',
  styleUrl: './metric-card.css',
  templateUrl: './metric-card.html',
})
export class MetricCard {
  @Input() title = '';
  @Input() value = 0;
  @Input() percentage?: number;
  @Input() icon = '📊';
}
