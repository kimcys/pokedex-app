import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompareService {

  private readonly MAX_COMPARE = 4;
  private compareListSubject = new BehaviorSubject<any[]>([]);
  compareList$ = this.compareListSubject.asObservable();

  addToCompare(pokemon: any): boolean {
    const current = this.compareListSubject.value;
    if (current.length < this.MAX_COMPARE && !this.isInCompare(pokemon.id)) {
      this.compareListSubject.next([...current, pokemon]);
      return true;
    }
    return false;
  }

  removeFromCompare(pokemonId: number): void {
    const current = this.compareListSubject.value;
    this.compareListSubject.next(current.filter(p => p.id !== pokemonId));
  }

  isInCompare(pokemonId: number): boolean {
    return this.compareListSubject.value.some(p => p.id === pokemonId);
  }

  clearCompare(): void {
    this.compareListSubject.next([]);
  }
}