import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './install-prompt.component.html',
  styleUrls: ['./install-prompt.component.scss']
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  showPrompt = false;
  private deferredPrompt: any;
  private eventListener: any;

  ngOnInit(): void {
    this.eventListener = (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showPrompt = true;
    };

    window.addEventListener('beforeinstallprompt', this.eventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', this.eventListener);
  }

  install(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        this.deferredPrompt = null;
        this.showPrompt = false;
      });
    }
  }

  dismiss(): void {
    this.showPrompt = false;
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  }
}