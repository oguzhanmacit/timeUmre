import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RouteChecklistService {

  private storageKey(routeId: string): string {
    return `umrah-route-checklist-${routeId}`;
  }

  getChecklistState(routeId: string): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(this.storageKey(routeId));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  updateChecklistItem(routeId: string, stepId: string, itemIndex: number, checked: boolean): void {
    const state = this.getChecklistState(routeId);
    state[`${stepId}:${itemIndex}`] = checked;
    localStorage.setItem(this.storageKey(routeId), JSON.stringify(state));
  }

  isChecklistItemChecked(routeId: string, stepId: string, itemIndex: number): boolean {
    return this.getChecklistState(routeId)[`${stepId}:${itemIndex}`] ?? false;
  }

  clearRouteChecklist(routeId: string): void {
    localStorage.removeItem(this.storageKey(routeId));
  }
}
