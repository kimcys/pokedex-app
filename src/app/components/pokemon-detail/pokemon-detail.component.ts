import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { EvolutionChain, Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-detail',
  imports: [CommonModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss'
})
export class PokemonDetailComponent {

  @Input() pokemonName!: string;
  @Input() pokemonId!: number;
  
  pokemon?: Pokemon;
  evolutionChain?: EvolutionChain[];
  isLoading = true;
  @Output() pokemonChange = new EventEmitter<string>();
  activeTab: 'about' | 'stats' | 'evolution' = 'about';
  
  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.loadPokemonDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemonName'] || changes['pokemonId']) {
      this.loadPokemonDetails();
    }
  }

  loadPokemonDetails(): void {
    this.isLoading = true;
    
    const request = this.pokemonName 
      ? this.pokemonService.getPokemonDetails(this.pokemonName)
      : this.pokemonService.getPokemonById(this.pokemonId);

    request.subscribe({
      next: (data) => {
        this.pokemon = data;
        this.loadEvolutionChain();
      },
      error: (error) => {
        console.error('Error loading pokemon details:', error);
        this.isLoading = false;
      }
    });
  }

  loadEvolutionChain(): void {
    if (!this.pokemon?.species?.url) {
      console.log('No species URL available');
      this.isLoading = false;
      return;
    }
    console.log('Loading evolution chain from:', this.pokemon.species.url); // Debug log
    
    this.pokemonService.getEvolutionChain(this.pokemon.species.url).subscribe({
      next: (response) => {
        console.log('Evolution chain response:', response); // Debug log
        this.evolutionChain = this.parseEvolutionChain(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading evolution chain:', error);
        this.isLoading = false;
      }
    });
  }

  parseEvolutionChain(chainData: any): EvolutionChain[] {
    const evolutionChain: EvolutionChain[] = [];
    
    const parseChain = (chain: any, level: number = 1) => {
      if (chain && chain.species) {
        evolutionChain.push({
          name: chain.species.name,
          url: chain.species.url,
          level: level,
          minLevel: chain.evolution_details && chain.evolution_details[0]?.min_level || null,
          item: chain.evolution_details && chain.evolution_details[0]?.item?.name || null
        });
          if (chain.evolves_to && chain.evolves_to.length > 0) {
          chain.evolves_to.forEach((evolution: any) => {
            parseChain(evolution, level + 1);
          });
        }
      }
    };
      if (chainData && chainData.chain) {
      parseChain(chainData.chain);
    }
    
    return evolutionChain;
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

  formatStatName(stat: string): string {
    const statNames: { [key: string]: string } = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed'
    };
    return statNames[stat] || stat;
  }

  getTotalStats(): number {
    if (!this.pokemon) return 0;
    return this.pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
  }

  getPokemonIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2];
  }

  getStatWidth(statValue: number): string {
    const percentage = (statValue / 255) * 100;
    return `${percentage}%`;
  }

  changeTab(tab: 'about' | 'stats' | 'evolution'): void {
    this.activeTab = tab;
  }

  onEvolutionClick(pokemonName: string): void {
    this.pokemonChange.emit(pokemonName);
  }
}
