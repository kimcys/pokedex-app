import { Component, OnInit } from '@angular/core';
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
export class CompareComponent implements OnInit {
  compareList: any[] = [];
  showCompare = false;
  selectedStats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

  constructor(
    private compareService: CompareService,
    private router: Router,
    private soundService: SoundService
  ) { }

  ngOnInit(): void {
    this.compareService.compareList$.subscribe(list => {
      this.compareList = list;
      this.showCompare = list.length > 0;
    });
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

  getStatPercentage(statValue: number, maxStat: number): number {
    if (maxStat === 0) return 0;
    return (statValue / maxStat) * 100;
  }

  getSummaryBarWidth(statValue: number, totalSum: number): number {
    if (totalSum === 0) return 0;
    return (statValue / totalSum) * 100;
  }

  getTotalSumForStat(statName: string): number {
    return this.compareList.reduce((total, pokemon) => {
      return total + this.getStatValue(pokemon, statName);
    }, 0);
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

  removeFromCompare(pokemonId: number, event: Event): void {
    event.stopPropagation();
    this.soundService.play('click');
    this.compareService.removeFromCompare(pokemonId);
  }

  closePanel(): void {
    this.soundService.play('click');
    this.showCompare = false;
  }

  viewPokemon(pokemonName: string): void {
    this.soundService.play('open');
    this.router.navigate(['/pokemon', pokemonName]);
  }

  clearCompare(): void {
    this.soundService.play('click');
    this.compareService.clearCompare();
  }

  formatStatName(stat: string): string {
    const statNames: { [key: string]: string } = {
      hp: 'HP',
      attack: 'ATTACK',
      defense: 'DEFEND',
      'special-attack': 'SP ATK',
      'special-defense': 'SP DEF',
      speed: 'SPEED'
    };
    return statNames[stat] || stat;
  }
}