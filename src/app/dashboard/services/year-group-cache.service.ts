import { Injectable } from '@angular/core';
import { YearGroupDetail } from '../analytics/year-group-details/year-group-model';


const STORAGE_KEY = 'bge.yearGroups.v1';
const TIMESTAMP_KEY = 'bge.yearGroups.fetchedAt';
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

@Injectable({ providedIn: 'root' })
export class YearGroupCacheService {
  /** Read cached, formatted year groups. Returns null if missing or stale. */
  read(): YearGroupDetail[] | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const fetchedAt = Number(sessionStorage.getItem(TIMESTAMP_KEY) ?? 0);
      if (!raw) return null;
      if (Date.now() - fetchedAt > MAX_AGE_MS) {
        this.clear();
        return null;
      }
      return JSON.parse(raw) as YearGroupDetail[];
    } catch {
      this.clear();
      return null;
    }
  }

  /** Persist formatted year groups. */
  write(groups: YearGroupDetail[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
      sessionStorage.setItem(TIMESTAMP_KEY, String(Date.now()));
    } catch {
      // sessionStorage may be unavailable (private mode, quota) — silently ignore
    }
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TIMESTAMP_KEY);
  }
}
