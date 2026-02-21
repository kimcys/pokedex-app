import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { EvolutionChain, Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { SoundService } from '../../services/sound.service';

type TypeEfficiencyRow = { type: string; multiplier: number; effect: string };

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss'
})
export class PokemonDetailComponent {
  @Input() pokemonName!: string;
  @Input() pokemonId!: number;

  @Output() pokemonChange = new EventEmitter<string>();

  pokemon?: Pokemon;
  evolutionChain: EvolutionChain[] = [];
  isLoading = true;

  // abilityName -> description
  abilityDescMap: Record<string, string> = {};

  // Combined incoming-damage multipliers for this pokemon (based on its types)
  typeEfficiencies: TypeEfficiencyRow[] = [];

  constructor(
    private pokemonService: PokemonService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.loadPokemonDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemonName'] || changes['pokemonId']) {
      this.loadPokemonDetails();
    }
  }

  // ---------------------------
  // MAIN LOADER
  // ---------------------------
  loadPokemonDetails(): void {
    // reset state (prevents stale/missing UI when switching)
    this.isLoading = true;
    this.pokemon = undefined;
    this.evolutionChain = [];
    this.typeEfficiencies = [];
    this.abilityDescMap = {};

    const request$ = this.pokemonName
      ? this.pokemonService.getPokemonDetails(this.pokemonName)
      : this.pokemonService.getPokemonById(this.pokemonId);

    request$.subscribe({
      next: (data) => {
        this.pokemon = data;

        // kick off parallel loads
        this.loadEvolutionChain();
        this.loadAbilityDescriptions();
        this.calculateTypeEfficienciesFromApi();

        // NOTE: isLoading should finish after evo chain (or you can coordinate all)
        // We'll set to false in evo chain subscribe.
      },
      error: (error) => {
        console.error('Error loading pokemon details:', error);
        this.isLoading = false;
      }
    });
  }

  // ---------------------------
  // EVOLUTION CHAIN (species -> chain)
  // ---------------------------
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

  // ---------------------------
  // ABILITY DESCRIPTIONS (API)
  // ---------------------------
  loadAbilityDescriptions(): void {
    if (!this.pokemon?.abilities?.length) return;

    // Build requests: /ability/{name}
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
    return this.abilityDescMap[abilityName.toLowerCase()] || 'Loading...';
  }

  // ---------------------------
  // TYPE EFFICIENCY (API damage_relations)
  // Incoming damage multipliers: double/half/no damage FROM
  // ---------------------------
  calculateTypeEfficienciesFromApi(): void {
    if (!this.pokemon?.types?.length) return;

    const myTypes = this.pokemon.types.map(t => t.type.name);

    const reqs$ = myTypes.map(t => this.pokemonService.getTypeDetails(t));

    forkJoin(reqs$).subscribe({
      next: (typesData: any[]) => {
        const mult: Record<string, number> = {};

        const apply = (arr: any[], factor: number) => {
          (arr ?? []).forEach(x => {
            const name = x.name;
            // 0 beats everything (no effect stays 0)
            if (mult[name] === 0) return;
            mult[name] = (mult[name] ?? 1) * factor;
          });
        };

        typesData.forEach(td => {
          const rel = td.damage_relations;
          apply(rel?.double_damage_from, 2);
          apply(rel?.half_damage_from, 0.5);
          apply(rel?.no_damage_from, 0);
        });

        this.typeEfficiencies = Object.entries(mult)
          .filter(([, m]) => m !== 1) // only show changed matchups
          .map(([type, multiplier]) => ({
            type,
            multiplier,
            effect:
              multiplier === 0 ? 'no effect' :
              multiplier > 1 ? 'super effective' :
              'not very effective'
          }))
          .sort((a, b) => b.multiplier - a.multiplier);
      },
      error: (err) => {
        console.error('Error loading type efficiencies:', err);
        this.typeEfficiencies = [];
      }
    });
  }

  // ---------------------------
  // UI HELPERS (you already had)
  // ---------------------------
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
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed'
    };
    return statNames[stat] || stat;
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

  // isHiddenAbility(index: number): boolean {
  //   return this.pokemon?.abilities?.[index]?.is_hidden ?? false;
  // }
}