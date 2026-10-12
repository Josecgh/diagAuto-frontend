import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DiagautoService, type UserRegistration } from '../../core/services/diagauto.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly diagauto = inject(DiagautoService);
  private readonly router = inject(Router);
  protected user: UserRegistration = { email: '', password: '', name: '', lastName: '' };
  protected readonly message = signal('');
  protected readonly successful = signal(false);
  protected readonly submitting = signal(false);

  submit(): void {
    this.message.set('');
    this.successful.set(false);
    this.submitting.set(true);
    this.diagauto.registerUser(this.user).subscribe({
      next: () => {
        this.successful.set(true);
        void this.router.navigate(['/login'], { queryParams: { registered: '1' } });
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.message.set(error.status === 409
          ? 'Ya existe una cuenta con ese correo electr\u00f3nico.'
          : error.status === 0
            ? 'No se pudo conectar con el servidor. Int\u00e9ntalo de nuevo.'
            : 'No se pudo crear la cuenta. Revisa los datos e int\u00e9ntalo de nuevo.');
      }
    });
  }
}
