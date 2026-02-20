import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { EvolutionChainResponse, Pokemon, PokemonListItem } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) { }

  getPokemonList(limit: number = 20, offset: number = 0): Observable<PokemonListItem[]> {
    return this.http.get<any>(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`).pipe(
      map(response => response.results)
    )
  }

  getPokemonDetails(name: string): Observable<Pokemon> {
    return this.http.get<any>(`${this.apiUrl}/pokemon/${name}`);
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}/pokemon/${id}`);
  }

  getTypes(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/type`).pipe(
      map(response => response.results.map((type: any) => type.name))
    );
  }

  getPokemonByType(type: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/type/${type}`).pipe(
      map(response => response.pokemon)
    );
  }
  getPokemonIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2];
  }

  getTotalStats(pokemon: Pokemon): number {
    return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
  }

  getEvolutionChain(url: string): Observable<EvolutionChainResponse> {
    return this.http.get<EvolutionChainResponse>(url);
  }

  getEvolutionChainFromPokemon(pokemonName: string): Observable<EvolutionChainResponse> {
    return this.getPokemonDetails(pokemonName).pipe(
      switchMap(pokemon => this.getEvolutionChain(pokemon.species.url))
    );
  }
}
