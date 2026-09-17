import { Component, computed, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-loader',
  styleUrl: './loader.css',
  templateUrl: './loader.html',
})
export class Loader {
  /** Diameter in pixels */
  size = input(64);
  /** Ring color — defaults to Netflix red */
  color = input('#2b6cb0');
  /** Ring thickness in pixels */
  thickness = input(6);
  /** Optional label shown below the spinner */
  label = input<string | null>(null);
  /** Renders as a full-screen overlay instead of an inline spinner */
  fullscreen = input(false);
  /** Label color — 'light' for dark backgrounds, 'dark' for light backgrounds */
  labelVariant = input<'light' | 'dark'>('dark');

  maskStyle = computed(() => {
    const inset = this.thickness();
    return `radial-gradient(farthest-side, transparent calc(100% - ${inset}px), #000 calc(100% - ${inset - 1}px))`;
  });

  gradientStyle = computed(() =>
    `conic-gradient(from 0deg, transparent 0%, ${this.color()} 100%)`
  );
}
