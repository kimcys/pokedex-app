import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { CompareService } from '../../services/compare.service';
import { FavoritesService } from '../../services/favorites.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent implements OnInit, OnDestroy {
  @Input() pokemonName!: string;

  pokemon?: Pokemon;
  isLoading: boolean = true;
  isInCompare = false;
  isFavorite = false;
  canAddToCompare = true;

  private destroy$ = new Subject<void>();

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private compareService: CompareService,
    private favoritesService: FavoritesService,
    private soundService: SoundService
  ) { }

  ngOnInit(): void {
    this.loadPokemon();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPokemon(): void {
    this.pokemonService.getPokemonDetails(this.pokemonName).subscribe({
      next: (data) => {
        this.pokemon = data;
        this.isLoading = false;
        this.checkCompareStatus();
        this.checkFavoriteStatus();
      },
      error: (err) => {
        console.error('Error loading pokemon details:', err);
        this.isLoading = false;
      }
    });
  }

  checkFavoriteStatus(): void {
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(favorites => {
        if (this.pokemon) {
          this.isFavorite = favorites.some(f => f.id === this.pokemon?.id);
        }
      });
  }

  checkCompareStatus(): void {
    this.compareService.compareList$
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        if (this.pokemon) {
          this.isInCompare = list.some(p => p.id === this.pokemon?.id);
          this.canAddToCompare = list.length < 4 || this.isInCompare;
        }
      });
  }

  toggleCompare(event: Event): void {
    event.stopPropagation();
    this.soundService.play('click');

    if (this.pokemon) {
      if (this.isInCompare) {
        this.compareService.removeFromCompare(this.pokemon.id);
      } else {
        this.compareService.addToCompare(this.pokemon);
      }
    }
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();

    if (this.pokemon) {
      const favoriteData = {
        id: this.pokemon.id,
        name: this.pokemon.name,
        image: this.pokemon.sprites.other['official-artwork'].front_default,
        types: this.pokemon.types.map(t => t.type.name)
      };

      this.favoritesService.toggleFavorite(favoriteData);

      if (!this.isFavorite) {
        this.soundService.play('favorite');
      }
    }
  }

  viewDetails(): void {
    this.soundService.play('open');
    this.router.navigate(['/pokemon', this.pokemonName]);
  }

  getPokemonImage(): string {
    return this.pokemon?.sprites?.other?.showdown?.front_default
      || this.pokemon?.sprites?.other?.['official-artwork']?.front_default
      || '';
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  formatStatName(stat: string): string {
    const statNames: { [key: string]: string } = {
      hp: 'HP',
      attack: 'ATTACK',
      defense: 'DEFEND',
      'special-attack': 'SP ATK',
      'special-defense': 'SP DEF',
      speed: 'SPEED'
    };
    return statNames[stat] || stat;
  }

  getStatStyles(stat: string): { bg: string; text: string; border: string } {
    const colors: Record<string, string> = {
      hp: '#ef4444',
      attack: '#f97316',
      defense: '#3b82f6',
      'special-attack': '#a855f7',
      'special-defense': '#14b8a6',
      speed: '#eab308'
    };
    const base = colors[stat] || '#6b7280';
    const isDark = document.body.classList.contains('dark-theme');
    return {
      bg: isDark ? this.hexToRgba(base, 0.15) : this.hexToRgba(base, 0.08),
      text: base,
      border: this.hexToRgba(base, isDark ? 0.6 : 0.4)
    };
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}