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
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule,
    SettingsComponent,
    CompareComponent,
    FavouritesComponent,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule
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
  ) {
    this.favoritesCount$ = this.favoritesService.favorites$.pipe(
      map(favorites => favorites.length)
    );
    this.compareCount$ = this.compareService.compareList$.pipe(
      map(list => list.length)
    );
  }

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