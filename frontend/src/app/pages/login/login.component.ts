import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; padding: 20px;">
      <div class="card" style="width: 100%; max-width: 420px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🏢</div>
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0;">会议室预约管理系统</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">请登录您的账户</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="username" 
              placeholder="请输入用户名"
              [class]="{'form-control is-invalid': submitted && f['username'].errors}">
            <div *ngIf="submitted && f['username'].errors" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
              <div *ngIf="f['username']['errors']['required']">请输入用户名</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              type="password" 
              class="form-control" 
              formControlName="password" 
              placeholder="请输入密码"
              [class]="{'form-control is-invalid': submitted && f['password'].errors}">
            <div *ngIf="submitted && f['password'].errors" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
              <div *ngIf="f['password']['errors']['required']">请输入密码</div>
              <div *ngIf="f['password']['errors']['minlength']">密码至少6个字符</div>
            </div>
          </div>

          <div *ngIf="errorMessage" style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-bottom: 16px; color: #991b1b; font-size: 14px;">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary" 
            style="width: 100%; padding: 12px; font-size: 16px;"
            [disabled]="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            还没有账户？
            <a routerLink="/register" style="color: #3b82f6; text-decoration: none; font-weight: 500;">立即注册</a>
          </p>
        </div>

        <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
          <h4 style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">测试账户：</h4>
          <p style="font-size: 12px; color: #4b5563; margin: 4px 0;">
            <strong>管理员：</strong> admin / admin123
          </p>
          <p style="font-size: 12px; color: #4b5563; margin: 4px 0;">
            <strong>普通用户：</strong> user1 / user123
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/bookings']);
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/bookings';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const request: LoginRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || '登录失败，请检查用户名和密码';
      }
    });
  }
}
