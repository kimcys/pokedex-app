import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { SoundService } from '../../services/sound.service';
import { CacheService } from '../../services/cache.service';
import { FavoritesService } from '../../services/favorites.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  soundEnabled = true;
  darkMode$!: Observable<boolean>;

  constructor(
    private themeService: ThemeService,
    private soundService: SoundService,
    private cacheService: CacheService,
    private favoritesService: FavoritesService
  ) {
    this.darkMode$ = this.themeService.darkMode$;
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
    this.soundService.play('click');
  }

  toggleSound(): void {
    this.soundService.toggleSounds();
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      setTimeout(() => this.soundService.play('click'), 100);
    }
  }

  clearCache(): void {
    this.cacheService.clear();
    this.soundService.play('click');
  }

  getCacheSize(): number {
    return 0;
  }

  getFavoritesCount(): number {
    return this.favoritesService.getFavorites().length;
  }

}
