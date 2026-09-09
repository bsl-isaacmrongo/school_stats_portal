import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  loginForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.error = '';

    const { username, password } = this.loginForm.value;
    this.auth.login(username!, password!).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
          console.log('Login successful:', success);
        }
        else{
           this.error = 'Login failed. Please check your credentials.';
           console.log('Login successful:', success);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
        this.error = 'Login failed. Please check your credentials.';
      }
    });
  }
}
