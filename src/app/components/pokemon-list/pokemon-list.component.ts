import { Component, OnInit } from '@angular/core';
import { PokemonListItem } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  imports: [],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss'
})
export class PokemonListComponent implements OnInit {

  pokemonList: PokemonListItem[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 20;
  isLoading: boolean = false;

  constructor(private pokemonService : PokemonService){}

  ngOnInit(): void {
    this.loadPokemonList();
  }

  loadPokemonList(): void {
    this.isLoading = true;
    this.pokemonService.getPokemonList(this.itemsPerPage, this.currentPage * this.itemsPerPage).subscribe(
      (data) => {
        this.pokemonList = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching Pokemon list:', error);
        this.isLoading = false;
      }
    );
  }

  loadMore(): void {
    this.currentPage++;
    this.loadPokemonList();
  }
}
