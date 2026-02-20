import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FavoritePokemon, FavoritesService } from '../../services/favorites.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-favourites',
  imports: [CommonModule],
  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.scss'
})
export class FavouritesComponent {

  @Output() closePanel = new EventEmitter<void>();

  favorites: FavoritePokemon[] = [];
  showPanel = true;

  constructor(
    private favoritesService: FavoritesService,
    private router: Router,
    private soundService: SoundService
  ) { }

  ngOnInit(): void {
    this.favoritesService.favorites$.subscribe(favs => {
      this.favorites = favs;
    });
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    return colors[type] || '#777';
  }

  viewPokemon(name: string): void {
    this.soundService.play('open');
    this.router.navigate(['/pokemon', name]);
    this.closePanel.emit();
  }

  removeFavorite(id: number, event: Event): void {
    event.stopPropagation();
    this.favoritesService.removeFavorite(id);
  }
  

  clearAll(): void {
    if (confirm('Remove all favorites?')) {
      this.favorites.forEach(fav => this.favoritesService.removeFavorite(fav.id));
    }
  }

  closeFavorites(): void {
    this.showPanel = false;
    this.closePanel.emit();
  }

  getGridClass(): string {
    const count = this.favorites.length;
    if (count === 1) return 'grid-1';
    if (count === 2) return 'grid-2';
    if (count === 3) return 'grid-3';
    return 'grid-4';
  }

  getUniqueTypesCount(): number {
    if (!this.favorites.length) return 0;
    
    const allTypes = new Set<string>();
    this.favorites.forEach(pokemon => {
      pokemon.types.forEach(type => allTypes.add(type));
    }); 
    return allTypes.size;
  }

  getAverageId(): string {
    if (!this.favorites.length) return '0';
    
    const sum = this.favorites.reduce((total, pokemon) => total + pokemon.id, 0);
    const average = Math.round(sum / this.favorites.length);
    return average.toString();
  }
}