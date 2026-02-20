import { Component, Input, input, OnInit } from '@angular/core';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CompareService } from '../../services/compare.service';
import { FavoritesService } from '../../services/favorites.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-pokemon-card',
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss'
})
export class PokemonCardComponent implements OnInit {

  @Input() pokemonName!: string;
  pokemon?: Pokemon;
  isLoading: boolean = true;
  isInCompare = false;
  isFavorite = false;
  canAddToCompare = true;
  private destroy$ = new Subject<void>();

  constructor(
    private pokemonServie: PokemonService,
    private router: Router,
    private compareService: CompareService,
    private favoritesService: FavoritesService,
    private soundService: SoundService
  ) { }

  ngOnInit(): void {
    this.loadPokemon();
  }

  loadPokemon(): void {
    this.pokemonServie.getPokemonDetails(this.pokemonName).subscribe({
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
    })
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
      } else {
      }
    }
  }

  viewDetails(): void {
    this.soundService.play('open');
    this.router.navigate(['/pokemon', this.pokemonName]);
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }
}
