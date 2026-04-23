import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; padding: 20px;">
      <div class="card" style="width: 100%; max-width: 420px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🏢</div>
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0;">创建新账户</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">填写以下信息完成注册</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">用户名 *</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="username" 
              placeholder="请输入用户名（3-50个字符）">
            <div *ngIf="submitted && f['username'].errors" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
              <div *ngIf="f['username']['errors']['required']">请输入用户名</div>
              <div *ngIf="f['username']['errors']['minlength']">用户名至少3个字符</div>
              <div *ngIf="f['username']['errors']['maxlength']">用户名最多50个字符</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">姓名 *</label>
            <input 
              type="text" 
              class="form-control" 
              formControlName="name" 
              placeholder="请输入真实姓名">
            <div *ngIf="submitted && f['name'].errors" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
              <div *ngIf="f['name']['errors']['required']">请输入姓名</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">邮箱 *</label>
            <input 
              type="email" 
              class="form-control" 
              formControlName="email" 
              placeholder="请输入邮箱地址">
            <div *ngIf="submitted && f['email'].errors" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
              <div *ngIf="f['email']['errors']['required']">请输入邮箱</div>
              <div *ngIf="f['email']['errors']['email']">请输入有效的邮箱地址</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">密码 *</label>
            <input 
              type="password" 
              class="form-control" 
              formControlName="password" 
              placeholder="请输入密码（至少6个字符）">
            <div *ngIf="submitted && f['password'].errors" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
              <div *ngIf="f['password']['errors']['required']">请输入密码</div>
              <div *ngIf="f['password']['errors']['minlength']">密码至少6个字符</div>
              <div *ngIf="f['password']['errors']['maxlength']">密码最多100个字符</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">确认密码 *</label>
            <input 
              type="password" 
              class="form-control" 
              formControlName="confirmPassword" 
              placeholder="请再次输入密码">
            <div *ngIf="submitted && f['confirmPassword'].errors" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
              <div *ngIf="f['confirmPassword']['errors']['required']">请确认密码</div>
              <div *ngIf="f['confirmPassword']['errors']['mismatch']">两次输入的密码不一致</div>
            </div>
          </div>

          <div *ngIf="errorMessage" style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-bottom: 16px; color: #991b1b; font-size: 14px;">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" style="background-color: #d1fae5; border: 1px solid #6ee7b7; border-radius: 6px; padding: 12px; margin-bottom: 16px; color: #065f46; font-size: 14px;">
            {{ successMessage }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary" 
            style="width: 100%; padding: 12px; font-size: 16px;"
            [disabled]="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            已有账户？
            <a routerLink="/login" style="color: #3b82f6; text-decoration: none; font-weight: 500;">立即登录</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/bookings']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    const request: RegisterRequest = {
      username: this.f['username'].value,
      name: this.f['name'].value,
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '注册成功！即将跳转到登录页面...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || '注册失败，请稍后重试';
      }
    });
  }
}
