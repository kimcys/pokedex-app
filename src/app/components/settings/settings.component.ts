import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

// Services
import { ThemeService } from '../../services/theme.service';
import { SoundService } from '../../services/sound.service';
import { CacheService } from '../../services/cache.service';
import { FavoritesService } from '../../services/favorites.service';

// Angular Material Imports
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'] // Can be empty or removed if using only Tailwind
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
    if (this.soundEnabled) {
      setTimeout(() => this.soundService.play('click'), 100);
    }
  }

  clearCache(): void {
    this.cacheService.clear();
    this.soundService.play('click');
  }

  getCacheSize(): number {
    // Implement actual cache size logic
    return this.cacheService.getSize() || 0;
  }

  getFavoritesCount(): number {
    return this.favoritesService.getFavorites().length;
  }

  get documentElementClass(): string {
    return document.documentElement.classList.contains('dark') ? 'Yes' : 'No';
  }
  
}