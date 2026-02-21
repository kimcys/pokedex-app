import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { PokemonListItem } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { SoundService } from '../../services/sound.service';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PokemonCardComponent,
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
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

  @ViewChild('loadMoreTrigger') loadMoreTrigger?: ElementRef<HTMLElement>;
  private io?: IntersectionObserver;
  private isLoadingMore = false;

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private soundService: SoundService
  ) { }

  ngOnInit(): void {
    this.loadPokemon();
    this.loadTypes();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.io?.disconnect();
  }

  onPokemonClick(pokemonName: string): void {
    this.soundService.play('click');
    this.router.navigate(['/pokemon', pokemonName]);
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 0;
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
        setTimeout(() => this.setupInfiniteScroll(), 0);
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

  clearSearch(): void {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
      input.value = '';
      this.searchSubject.next('');
    }
  }

  filterByType(type: string): void {
    this.soundService.play('click');
    this.selectedType = this.selectedType === type ? '' : type;
    this.currentPage = 0;
    this.filterPokemon();
  }

  getTypeButtonClass(type: string): string {
    const baseClass = 'px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95';
    return baseClass;
  }

  filterPokemon(): void {
    let filtered = [...this.pokemonList];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (this.selectedType) {
      this.isLoading = true;
      this.pokemonService.getPokemonByType(this.selectedType).subscribe({
        next: (pokemonOfType) => {
          const typePokemonNames = pokemonOfType.map(p => p.pokemon.name);
          filtered = filtered.filter(p => typePokemonNames.includes(p.name));
          this.totalCount = filtered.length;

          // Apply pagination
          const start = this.currentPage * this.itemsPerPage;
          const end = start + this.itemsPerPage;
          this.filteredPokemon = filtered.slice(start, end);
          this.isLoading = false;
          this.setupInfiniteScroll();
        },
        error: (error) => {
          console.error('Error filtering by type:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.totalCount = filtered.length;

      // Apply pagination
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.filteredPokemon = filtered.slice(start, end);
    }
  }

  loadMore(): void {
    if (this.isLoading || this.isLoadingMore) return;
    if (this.filteredPokemon.length >= this.totalCount) return;
    this.isLoadingMore = true;
    this.currentPage++;
    let filtered = [...this.pokemonList];

    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    const applyPagination = (list: PokemonListItem[]) => {
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const moreItems = list.slice(start, end);

      this.filteredPokemon = [...this.filteredPokemon, ...moreItems];
      this.isLoadingMore = false;
      setTimeout(() => this.setupInfiniteScroll(), 0);
    };

    if (this.selectedType) {
      this.pokemonService.getPokemonByType(this.selectedType).subscribe({
        next: (pokemonOfType) => {
          const typePokemonNames = pokemonOfType.map(p => p.pokemon.name);
          const typed = filtered.filter(p => typePokemonNames.includes(p.name));
          applyPagination(typed);
        },
        error: () => {
          this.isLoadingMore = false;
        }
      });
    } else {
      applyPagination(filtered);
    }
  }

  private setupInfiniteScroll(): void {
    this.io?.disconnect();
    if (!this.loadMoreTrigger?.nativeElement) return;
    this.io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          this.loadMore();
        }
      },
      {
        root: null,
        rootMargin: '400px',
        threshold: 0.01
      }
    );

    this.io.observe(this.loadMoreTrigger.nativeElement);
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