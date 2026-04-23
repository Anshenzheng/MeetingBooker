import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="authService.isLoggedIn()" class="navbar">
      <div class="navbar-container">
        <a routerLink="/bookings" class="navbar-brand">会议室预约管理系统</a>
        <div class="navbar-nav">
          <a *ngIf="authService.isAdmin()" routerLink="/rooms" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">会议室管理</a>
          <a routerLink="/bookings" routerLinkActive="active" class="nav-link">预约管理</a>
          <a routerLink="/history" routerLinkActive="active" class="nav-link">历史记录</a>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div *ngIf="currentUser" style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
            <span style="display: inline-block; width: 32px; height: 32px; background-color: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
              {{ currentUser.name.charAt(0) }}
            </span>
            <div>
              <div style="font-weight: 500; color: #1f2937;">{{ currentUser.name }}</div>
              <div style="font-size: 12px; color: #6b7280;">
                {{ currentUser.role === 'ADMIN' ? '管理员' : '普通用户' }}
              </div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" (click)="logout()">退出登录</button>
        </div>
      </div>
    </nav>
    
    <main style="padding: 24px 0;">
      <div class="container" *ngIf="authService.isLoggedIn()">
        <router-outlet></router-outlet>
      </div>
    </main>

    <router-outlet *ngIf="!authService.isLoggedIn()"></router-outlet>
  `
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    if (confirm('确定要退出登录吗？')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
