import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  imports: [CommonModule, NgxEchartsModule],
  selector: 'app-gender-chart',
  styleUrl: './gender-chart.css',
  templateUrl: './gender-chart.html',
})
export class GenderChart {
  @Input() data!: { boys: number; girls: number };
  chartOptions: EChartsOption = {};

  ngOnInit() { this.updateChart(); }
  ngOnChanges() { this.updateChart(); }

  private updateChart(): void {
    const total = this.data.boys + this.data.girls;
    this.chartOptions = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, left: 'center' },
      series: [{
        type: 'pie',
        radius: ['30%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: true, position: 'center', formatter: `Total\n${total}`, fontSize: 18, fontWeight: 'bold' },
        emphasis: { scale: true },
        data: [
          { value: this.data.boys, name: 'Boys', itemStyle: { color: '#3B82F6' } },
          { value: this.data.girls, name: 'Girls', itemStyle: { color: '#EC4899' } }
        ]
      }]
    };
  }
}
