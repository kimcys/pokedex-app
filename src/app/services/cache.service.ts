import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private cache = new Map<string, { data: any, timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  constructor() { }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    try {
      localStorage.setItem(`pokemon_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('localStorage quota exceeded');
    }
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    try {
      const stored = localStorage.getItem(`pokemon_${key}`);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        if ((Date.now() - timestamp) < this.CACHE_DURATION) {
          this.cache.set(key, { data, timestamp });
          return data;
        } else {
          localStorage.removeItem(`pokemon_${key}`);
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage');
    }

    return null;
  }

  getSize(): number {
    const memorySize = this.cache.size;
    const storageSize = Object.keys(localStorage)
      .filter(key => key.startsWith('pokemon_'))
      .length;
    return storageSize || memorySize;
  }

  clear(): void {
    this.cache.clear();
    Object.keys(localStorage)
      .filter(key => key.startsWith('pokemon_'))
      .forEach(key => localStorage.removeItem(key));
  }
}
