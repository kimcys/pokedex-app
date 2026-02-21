import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { EvolutionChainResponse, Pokemon, PokemonListItem, PokemonTypeListResponse, PokemonTypeResponse } from '../models/pokemon.model';
import { CacheService } from './cache.service';

type PokemonSpeciesResponse = {
  evolution_chain: { url: string };
};

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) { }

  private cacheFirst<T>(key: string, fetch$: Observable<T>): Observable<T> {
    const cached = this.cache.get(key);
    if (cached) return of(cached as T);
    return fetch$.pipe(tap(value => this.cache.set(key, value)));
  }

  getPokemonList(limit: number = 20, offset: number = 0): Observable<PokemonListItem[]> {
    const key = `pokemon_list_${limit}_${offset}`;
    return this.cacheFirst(
      key,
      this.http.get<any>(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`).pipe(
        map(res => res.results as PokemonListItem[])
      )
    );
  }

  getPokemonDetails(name: string): Observable<Pokemon> {
    const normalized = name.trim().toLowerCase();
    const key = `pokemon_details_${normalized}`;
    return this.cacheFirst(
      key,
      this.http.get<Pokemon>(`${this.apiUrl}/pokemon/${normalized}`)
    );
  }

  getPokemonById(id: number): Observable<Pokemon> {
    const key = `pokemon_id_${id}`;
    return this.cacheFirst(
      key,
      this.http.get<Pokemon>(`${this.apiUrl}/pokemon/${id}`)
    );
  }

  getTypes(): Observable<string[]> {
    const key = `types_all`;
    return this.cacheFirst(
      key,
      this.http.get<PokemonTypeListResponse>(`${this.apiUrl}/type`).pipe(
        map(res => (res.results ?? []).map((t: any) => t.name as string))
      )
    );
  }

  getPokemonByType(type: string): Observable<any[]> {
    const normalized = type.trim().toLowerCase();
    const key = `type_${normalized}_pokemon`;
    return this.cacheFirst(
      key,
      this.http.get<PokemonTypeResponse>(`${this.apiUrl}/type/${normalized}`).pipe(
        map(res => res.pokemon ?? [])
      )
    );
  }

  getPokemonIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2];
  }

  getTotalStats(pokemon: Pokemon): number {
    return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
  }

  getPokemonSpecies(speciesUrl: string): Observable<PokemonSpeciesResponse> {
    const key = `species_${speciesUrl}`;
    return this.cacheFirst(key, this.http.get<PokemonSpeciesResponse>(speciesUrl));
  }

  getEvolutionChain(chainUrl: string): Observable<EvolutionChainResponse> {
    const key = `evo_chain_${chainUrl}`;
    return this.cacheFirst(key, this.http.get<EvolutionChainResponse>(chainUrl));
  }

  getEvolutionChainFromPokemon(pokemonName: string): Observable<EvolutionChainResponse> {
    const normalized = pokemonName.trim().toLowerCase();
    const key = `evo_from_pokemon_${normalized}`;

    return this.cacheFirst(
      key,
      this.getPokemonDetails(normalized).pipe(
        switchMap(pokemon => this.getPokemonSpecies(pokemon.species.url)),
        switchMap(species => this.getEvolutionChain(species.evolution_chain.url))
      )
    );
  }

  getAbilityDetails(name: string) {
    return this.http.get<any>(`${this.apiUrl}/ability/${name}`);
  }
  
  getTypeDetails(typeName: string) {
    return this.http.get<any>(`${this.apiUrl}/type/${typeName}`);
  }
  
}
