import { Component, Input, input, OnInit } from '@angular/core';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(
    private pokemonServie: PokemonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPokemon();
  }

  loadPokemon(): void {
    this.pokemonServie.getPokemonDetails(this.pokemonName).subscribe({
      next: (data) => {
        this.pokemon = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading pokemon details:', err);
        this.isLoading = false;
      }
    })
  }

  viewDetails(): void {
    this.router.navigate(['/pokemon', this.pokemonName]);
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }
}
