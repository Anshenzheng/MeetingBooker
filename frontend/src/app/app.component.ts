import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a routerLink="/rooms" class="navbar-brand">会议室预约管理系统</a>
        <div class="navbar-nav">
          <a routerLink="/rooms" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">会议室管理</a>
          <a routerLink="/bookings" routerLinkActive="active" class="nav-link">预约审核</a>
          <a routerLink="/history" routerLinkActive="active" class="nav-link">历史记录</a>
        </div>
      </div>
    </nav>
    
    <main style="padding: 24px 0;">
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </main>
  `
})
export class AppComponent {
}
