import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled = true;

  constructor() {
    this.loadSound('favorite', '/sound/meow.mp3');
    this.loadSound('bulbausar', '/sound/bulbausar.mp3');
    this.loadSound('open', '/sound/who-pokemon.mp3');
  }

  private loadSound(name: string, url: string): void {
    const audio = new Audio();
    audio.src = url;
    audio.load();
    this.sounds[name] = audio;
  }

  play(name: string): void {
    if (!this.enabled) return;

    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Sound play failed:', e));
    }
  }

  toggleSounds(): void {
    this.enabled = !this.enabled;
  }
}