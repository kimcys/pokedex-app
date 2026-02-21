import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { forkJoin, map, switchMap } from 'rxjs';
import { EvolutionChain, Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { SoundService } from '../../services/sound.service';
import { MatIconModule } from '@angular/material/icon';

type TypeEfficiencyRow = { type: string; multiplier: number; effect: string };
type TypeRelationsUI = {
  doubleFrom: string[];
  doubleTo: string[];
  halfFrom: string[];
  halfTo: string[];
  noFrom: string[];
  noTo: string[];
};
type TypeEfficiencyByType = Record<string, TypeRelationsUI>;


@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss']
})
export class PokemonDetailComponent {
  @Input() pokemonName!: string;
  @Input() pokemonId!: number;
  @Output() pokemonChange = new EventEmitter<string>();

  pokemon?: Pokemon;
  evolutionChain: EvolutionChain[] = [];
  isLoading = true;
  typeEfficiencyByType: TypeEfficiencyByType = {};
  abilityDescMap: Record<string, string> = {};
  typeEfficiencies: TypeEfficiencyRow[] = [];

  constructor(
    private pokemonService: PokemonService,
    private soundService: SoundService
  ) { }

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
    this.pokemon = undefined;
    this.evolutionChain = [];
    this.typeEfficiencies = [];
    this.abilityDescMap = {};
    this.typeEfficiencyByType = {};

    const request$ = this.pokemonName
      ? this.pokemonService.getPokemonDetails(this.pokemonName)
      : this.pokemonService.getPokemonById(this.pokemonId);

    request$.subscribe({
      next: (data) => {
        this.pokemon = data;
        this.loadEvolutionChain();
        this.loadAbilityDescriptions();
        this.calculateTypeEfficienciesFromApi();
      },
      error: (error) => {
        console.error('Error loading pokemon details:', error);
        this.isLoading = false;
      }
    });
  }

  loadEvolutionChain(): void {
    if (!this.pokemon?.species?.url) {
      this.isLoading = false;
      return;
    }

    this.pokemonService.getPokemonSpecies(this.pokemon.species.url).pipe(
      switchMap(species => this.pokemonService.getEvolutionChain(species.evolution_chain.url))
    ).subscribe({
      next: (response) => {
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
    const out: EvolutionChain[] = [];

    const parseChain = (node: any, level: number = 1) => {
      if (!node?.species?.name) return;

      const details = node.evolution_details?.[0];

      out.push({
        name: node.species.name,
        url: node.species.url,
        level,
        minLevel: details?.min_level ?? null,
        item: details?.item?.name ?? null
      });

      (node.evolves_to ?? []).forEach((child: any) => parseChain(child, level + 1));
    };

    if (chainData?.chain) parseChain(chainData.chain);
    return out;
  }

  loadAbilityDescriptions(): void {
    if (!this.pokemon?.abilities?.length) return;
    const reqs$ = this.pokemon.abilities.map(a =>
      this.pokemonService.getAbilityDetails(a.ability.name).pipe(
        map(res => {
          const en = res.effect_entries?.find((e: any) => e.language?.name === 'en');
          const desc = en?.short_effect || en?.effect || 'No description available.';
          return { name: a.ability.name.toLowerCase(), desc };
        })
      )
    );

    forkJoin(reqs$).subscribe({
      next: (rows) => {
        rows.forEach(r => (this.abilityDescMap[r.name] = r.desc));
      },
      error: (err) => {
        console.error('Error loading ability descriptions:', err);
      }
    });
  }

  getAbilityDescription(abilityName: string): string {
    return this.abilityDescMap[abilityName.toLowerCase()] || 'Loading description...';
  }

  calculateTypeEfficienciesFromApi(): void {
    if (!this.pokemon?.types?.length) return;

    const myTypes = this.pokemon.types.map(t => t.type.name);

    forkJoin(myTypes.map(t => this.pokemonService.getTypeDetails(t))).subscribe({
      next: (typesData: any[]) => {
        const out: TypeEfficiencyByType = {};

        typesData.forEach((td: any) => {
          const typeName: string = td?.name;
          const rel = td?.damage_relations ?? {};

          const names = (arr: any[]) => (arr ?? []).map(x => x.name);

          out[typeName] = {
            doubleFrom: names(rel.double_damage_from),
            doubleTo: names(rel.double_damage_to),
            halfFrom: names(rel.half_damage_from),
            halfTo: names(rel.half_damage_to),
            noFrom: names(rel.no_damage_from),
            noTo: names(rel.no_damage_to),
          };
        });

        this.typeEfficiencyByType = out;
      },
      error: (err) => {
        console.error('Error loading type efficiencies:', err);
        this.typeEfficiencyByType = {};
      }
    });
  }

  getPokemonImage(): string {
    return this.pokemon?.sprites?.other?.showdown?.front_default
      || this.pokemon?.sprites?.other?.['official-artwork']?.front_default
      || '';
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

  getPokemonIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2];
  }

  onEvolutionClick(pokemonName: string): void {
    this.soundService.play('click');
    this.pokemonChange.emit(pokemonName);
  }

  isHiddenAbility(index: number): boolean {
    if (!this.pokemon?.abilities?.length) return false;
    return index === this.pokemon.abilities.length - 1;
  }
}