import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonDetailComponent } from '../../components/pokemon-detail/pokemon-detail.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-pokemon-detail-page',
  imports: [CommonModule, PokemonDetailComponent],
  templateUrl: './pokemon-detail-page.component.html',
  styleUrl: './pokemon-detail-page.component.scss'
})
export class PokemonDetailPageComponent {

  pokemonName: string = '';
  pokemonId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['name']) {
        this.pokemonName = params['name'];
      } else if (params['id']) {
        this.pokemonId = +params['id'];
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  onPokemonChange(pokemonName: string): void {
    this.router.navigate(['/pokemon', pokemonName]);
  }
}
