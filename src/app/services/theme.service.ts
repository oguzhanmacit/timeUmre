import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'tu-theme';
  isDark = true;

  constructor() {
    const saved = localStorage.getItem(this.KEY);
    this.isDark = saved !== 'light';
    this.apply();
  }

  toggle() {
    this.isDark = !this.isDark;
    localStorage.setItem(this.KEY, this.isDark ? 'dark' : 'light');
    this.apply();
  }

  private apply() {
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
  }
}
