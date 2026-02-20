import { Component } from '@angular/core';
import { PokemonListItem } from '../../models/pokemon.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PokemonCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  pokemonList: PokemonListItem[] = [];
  filteredPokemon: PokemonListItem[] = [];
  types: string[] = [];
  selectedType: string = '';
  searchTerm: string = '';
  currentPage = 0;
  itemsPerPage = 20;
  isLoading = false;
  totalCount = 0;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private pokemonService: PokemonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPokemon();
    this.loadTypes();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPokemonClick(pokemonName: string): void {
    this.router.navigate(['/pokemon', pokemonName]);
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.filterPokemon();
    });
  }

  loadPokemon(): void {
    this.isLoading = true;
    this.pokemonService.getPokemonList(1000, 0).subscribe({
      next: (data) => {
        this.pokemonList = data;
        this.totalCount = data.length;
        this.filterPokemon();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pokemon:', error);
        this.isLoading = false;
      }
    });
  }

  loadTypes(): void {
    this.pokemonService.getTypes().subscribe({
      next: (types) => {
        this.types = types;
      },
      error: (error) => console.error('Error loading types:', error)
    });
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  filterByType(type: string): void {
    this.selectedType = this.selectedType === type ? '' : type;
    this.currentPage = 0;
    this.filterPokemon();
  }

  filterPokemon(): void {
    let filtered = [...this.pokemonList];

    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedType) {
      this.pokemonService.getPokemonByType(this.selectedType).subscribe({
        next: (pokemonOfType) => {
          const typePokemonNames = pokemonOfType.map((p: { pokemon: { name: string } }) => p.pokemon.name);
          filtered = filtered.filter(p => typePokemonNames.includes(p.name));
          this.applyPagination(filtered);
        }
      });
    } else {
      this.applyPagination(filtered);
    }
  }

  applyPagination(filtered: PokemonListItem[]): void {
    this.totalCount = filtered.length;
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredPokemon = filtered.slice(start, end);
  }

  loadMore(): void {
    this.currentPage++;
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    let filtered = [...this.pokemonList];

    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    const moreItems = filtered.slice(start, end);
    this.filteredPokemon = [...this.filteredPokemon, ...moreItems];
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
}
