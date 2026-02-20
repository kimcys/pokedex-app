import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-install-prompt',
  imports: [CommonModule],
  templateUrl: './install-prompt.component.html',
  styleUrl: './install-prompt.component.scss'
})
export class InstallPromptComponent implements OnInit {

  showPrompt = false;
  private deferredPrompt: any;

  ngOnInit(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showPrompt = true;
    });
  }

  install(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then(() => {
        this.deferredPrompt = null;
        this.showPrompt = false;
      });
    }
  }

  dismiss(): void {
    this.showPrompt = false;
  }

}
