import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { map, Observable } from 'rxjs';
import { FavoritesService } from './services/favorites.service';
import { CompareService } from './services/compare.service';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './components/settings/settings.component';
import { CompareComponent } from './components/compare/compare.component';
import { FavouritesComponent } from './components/favourites/favourites.component';
import { SoundService } from './services/sound.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule,
    SettingsComponent,
    CompareComponent,
    FavouritesComponent,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pokedex-app';
  showSettings = false;
  showCompare = false;
  showFavorites = false;
  favoritesCount$: Observable<number>;
  compareCount$: Observable<number>;

  constructor(
    private favoritesService: FavoritesService,
    private compareService: CompareService,
    private soundService: SoundService 
  ) {
    this.favoritesCount$ = this.favoritesService.favorites$.pipe(
      map(favorites => favorites.length)
    );
    this.compareCount$ = this.compareService.compareList$.pipe(
      map(list => list.length)
    );
  }

  ngOnInit(): void {}

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  closeSettings(): void {
    this.showSettings = false;
  }

  toggleCompare(): void {
    this.showCompare = !this.showCompare;
  }

  closeCompare(): void {
    this.showCompare = false;
  }

toggleFavorites(): void {
  this.showFavorites = !this.showFavorites;
}

  closeFavorites(): void {
    this.showFavorites = false;
  }
}
