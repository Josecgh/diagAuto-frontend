import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DiagautoService } from '../../core/services/diagauto.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly diagauto = inject(DiagautoService);
  private readonly router = inject(Router);
  protected readonly profileMenuOpen = signal(false);

  toggleProfileMenu(): void {
    this.profileMenuOpen.update((open) => !open);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  logout(): void {
    this.diagauto.logout().subscribe({
      next: () => {
        this.closeProfileMenu();
        void this.router.navigateByUrl('/home');
      },
      error: () => {
        this.closeProfileMenu();
        void this.router.navigateByUrl('/home');
      }
    });
  }
}
