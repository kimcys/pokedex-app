import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FavoritePokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private readonly STORAGE_KEY = 'pokemon_favorites';
  private favoritesSubject = new BehaviorSubject<FavoritePokemon[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.favoritesSubject.next(JSON.parse(stored));
    }
  }

  private saveFavorites(favorites: FavoritePokemon[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    this.favoritesSubject.next(favorites);
  }

  addFavorite(pokemon: FavoritePokemon): void {
    const current = this.favoritesSubject.value;
    if (!this.isFavorite(pokemon.id)) {
      this.saveFavorites([...current, pokemon]);
    }
  }

  removeFavorite(pokemonId: number): void {
    const current = this.favoritesSubject.value;
    this.saveFavorites(current.filter(f => f.id !== pokemonId));
  }

  isFavorite(pokemonId: number): boolean {
    return this.favoritesSubject.value.some(f => f.id === pokemonId);
  }

  toggleFavorite(pokemon: FavoritePokemon): void {
    if (this.isFavorite(pokemon.id)) {
      this.removeFavorite(pokemon.id);
    } else {
      this.addFavorite(pokemon);
    }
  }

  getFavorites(): FavoritePokemon[] {
    return this.favoritesSubject.value;
  }
}
