import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DiagautoService } from '../../core/services/diagauto.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly diagauto = inject(DiagautoService);
  private readonly router = inject(Router);
  protected email = '';
  protected password = '';
  protected readonly message = signal(
    inject(ActivatedRoute).snapshot.queryParamMap.has('registered')
      ? 'Cuenta creada. Inicia sesi\u00f3n para continuar.'
      : ''
  );
  protected readonly successful = signal(false);
  protected readonly submitting = signal(false);

  submit(): void {
    this.message.set('');
    this.successful.set(false);
    this.submitting.set(true);
    this.diagauto.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        void this.router.navigateByUrl('/vehicles');
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.message.set(error.status === 0
          ? 'No se pudo conectar con el servidor. Int\u00e9ntalo de nuevo.'
          : 'No se pudo iniciar sesi\u00f3n. Comprueba tu correo y contrase\u00f1a.');
      }
    });
  }
}
