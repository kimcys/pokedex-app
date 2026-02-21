import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompareService } from '../../services/compare.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit, AfterViewInit {

  compareList: any[] = [];
  showCompare = false;
  animationTriggered = false;
  @Output() closed = new EventEmitter<void>();

  selectedStats = [
    'hp',
    'attack',
    'defense',
    'special-attack',
    'special-defense',
    'speed'
  ];

  constructor(
    private compareService: CompareService,
    private router: Router,
    private soundService: SoundService,
  ) { }

  ngOnInit(): void {
    this.compareService.compareList$.subscribe(list => {
      this.compareList = list;
      this.openPanelWithAnimation();
    });
  }

  ngAfterViewInit(): void {
    if (this.showCompare && !this.animationTriggered) {
      setTimeout(() => {
        this.animationTriggered = true;
      }, 200);
    }
  }

  private openPanelWithAnimation(): void {
    this.showCompare = true;
    this.animationTriggered = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.animationTriggered = true;
      });
    });
  }

  closeCompare(): void {
    this.soundService.play('click');
    this.showCompare = false;
    this.animationTriggered = false;
    this.closed.emit();
  }

  openPanel(): void {
    this.openPanelWithAnimation();
  }

  clearCompare(): void {
    this.soundService.play('click');
    this.compareService.clearCompare();
  }

  removeFromCompare(pokemonId: number, event: Event): void {
    event.stopPropagation();
    this.soundService.play('click');
    this.compareService.removeFromCompare(pokemonId);
  }

  viewPokemon(pokemonName: string): void {
    this.soundService.play('open');
    this.router.navigate(['/pokemon', pokemonName]);
    this.closed.emit();
  }

  getStatValue(pokemon: any, statName: string): number {
    const stat = pokemon.stats.find((s: any) => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
  }

  getTotalStats(pokemon: any): number {
    return pokemon.stats.reduce((total: number, stat: any) => total + stat.base_stat, 0);
  }

  getAverageStat(statName: string): number {
    if (this.compareList.length === 0) return 0;

    const sum = this.compareList.reduce((total, pokemon) => {
      return total + this.getStatValue(pokemon, statName);
    }, 0);

    return Math.round(sum / this.compareList.length);
  }

  getHighestStat(statName: string): number {
    return Math.max(...this.compareList.map(p => this.getStatValue(p, statName)));
  }

  getTotalSumForStat(statName: string): number {
    return this.compareList.reduce((total, pokemon) => {
      return total + this.getStatValue(pokemon, statName);
    }, 0);
  }

  getStatPercentage(statValue: number, maxStat: number): number {
    if (maxStat === 0) return 0;
    return (statValue / maxStat) * 100;
  }

  getSummaryBarWidth(statValue: number, totalSum: number): number {
    if (totalSum === 0) return 0;
    return (statValue / totalSum) * 100;
  }

  getStatColor(value: number, maxValue: number): string {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return '#10b981';   // green
    if (percentage >= 60) return '#3b82f6';   // blue
    if (percentage >= 40) return '#f59e0b';   // yellow
    return '#ef4444';                         // red
  }

  getTotalColor(total: number): string {
    if (total >= 600) return '#10b981';
    if (total >= 500) return '#3b82f6';
    if (total >= 400) return '#f59e0b';
    return '#ef4444';
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

  formatStatName(stat: string): string {
    const statNames: { [key: string]: string } = {
      hp: 'HP',
      attack: 'ATK',
      defense: 'DEF',
      'special-attack': 'SP.ATK',
      'special-defense': 'SP.DEF',
      speed: 'SPD'
    };

    return statNames[stat] || stat;
  }
}