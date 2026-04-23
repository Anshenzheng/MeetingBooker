import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { Booking, BookingStatus } from '../../models/booking.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">历史记录</h1>
      <p class="page-subtitle">查看所有会议室预约的历史使用记录</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">预约历史记录</h2>
      </div>

      <!-- 高级过滤器 -->
      <div class="filter-bar">
        <div class="filter-item">
          <label class="filter-label">会议室</label>
          <select class="filter-select" [(ngModel)]="filterRoomId" (change)="applyFilters()">
            <option value="">全部会议室</option>
            <option *ngFor="let room of rooms" [value]="room.id">
              {{ room.roomNumber }} ({{ room.floor }})
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label class="filter-label">状态</label>
          <select class="filter-select" [(ngModel)]="filterStatus" (change)="applyFilters()">
            <option value="">全部状态</option>
            <option value="PENDING">待审核</option>
            <option value="APPROVED">已批准</option>
            <option value="REJECTED">已拒绝</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="filter-label">开始日期</label>
          <input type="date" class="filter-select" [(ngModel)]="filterStartDate" (change)="applyFilters()">
        </div>

        <div class="filter-item">
          <label class="filter-label">结束日期</label>
          <input type="date" class="filter-select" [(ngModel)]="filterEndDate" (change)="applyFilters()">
        </div>

        <div class="filter-item">
          <label class="filter-label">申请人</label>
          <input type="text" class="filter-select" [(ngModel)]="filterApplicant" (input)="applyFilters()" placeholder="搜索申请人...">
        </div>

        <div class="filter-item">
          <label class="filter-label" style="visibility: hidden;">操作</label>
          <button class="btn btn-outline btn-sm" (click)="resetFilters()">重置筛选</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!loading && filteredBookings.length === 0" class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text">暂无历史记录</div>
        <div class="empty-state-hint">请调整筛选条件或稍后再试</div>
      </div>

      <div *ngIf="!loading && filteredBookings.length > 0" class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>会议室</th>
              <th>会议主题</th>
              <th>申请人</th>
              <th>参会人数</th>
              <th>预约日期</th>
              <th>时间段</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of filteredBookings">
              <td>
                <div>
                  <strong>{{ booking.room.roomNumber }}</strong>
                  <div style="font-size: 12px; color: #6b7280;">{{ booking.room.floor }}</div>
                </div>
              </td>
              <td>{{ booking.meetingTitle }}</td>
              <td>
                <div>
                  <div>{{ booking.applicantName }}</div>
                  <div style="font-size: 12px; color: #9ca3af;">{{ booking.applicantEmail }}</div>
                </div>
              </td>
              <td>{{ booking.participants }} 人</td>
              <td>{{ formatDate(booking.startTime) }}</td>
              <td>
                <div style="font-size: 13px;">
                  <div>{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</div>
                </div>
              </td>
              <td>
                <span [class]="'status-badge status-' + booking.status.toLowerCase()">
                  {{ getStatusText(booking.status) }}
                </span>
              </td>
              <td>
                <button class="btn btn-outline btn-sm" (click)="viewDetails(booking)">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && filteredBookings.length > 0" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; color: #6b7280; font-size: 14px;">
        <span>共 {{ filteredBookings.length }} 条记录</span>
      </div>
    </div>

    <!-- 详情模态框 -->
    <div *ngIf="showDetailModal && selectedBooking" class="modal-overlay" (click)="closeDetailModal()">
      <div class="modal modal-large fade-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">预约详情</h3>
          <button class="modal-close" (click)="closeDetailModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">会议主题</h4>
              <p style="font-weight: 600;">{{ selectedBooking.meetingTitle }}</p>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">会议室</h4>
              <p style="font-weight: 600;">{{ selectedBooking.room.roomNumber }} ({{ selectedBooking.room.floor }})</p>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">申请人</h4>
              <p>{{ selectedBooking.applicantName }}</p>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">申请人邮箱</h4>
              <p>{{ selectedBooking.applicantEmail }}</p>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">参会人数</h4>
              <p>{{ selectedBooking.participants }} 人</p>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">状态</h4>
              <span [class]="'status-badge status-' + selectedBooking.status.toLowerCase()">
                {{ getStatusText(selectedBooking.status) }}
              </span>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">预约日期</h4>
              <p>{{ formatDate(selectedBooking.startTime) }}</p>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">预约时间</h4>
              <p>{{ formatTime(selectedBooking.startTime) }} - {{ formatTime(selectedBooking.endTime) }}</p>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">创建时间</h4>
              <p>{{ formatDateTime(selectedBooking.createdAt) }}</p>
            </div>
            <div>
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">更新时间</h4>
              <p>{{ formatDateTime(selectedBooking.updatedAt) }}</p>
            </div>
            <div *ngIf="selectedBooking.approvedBy">
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">审批人</h4>
              <p>{{ selectedBooking.approvedBy }}</p>
            </div>
            <div *ngIf="selectedBooking.approvedAt">
              <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">审批时间</h4>
              <p>{{ formatDateTime(selectedBooking.approvedAt) }}</p>
            </div>
          </div>

          <div style="margin-top: 20px;">
            <h4 style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">会议描述</h4>
            <p>{{ selectedBooking.description || '无' }}</p>
          </div>

          <div *ngIf="selectedBooking.rejectReason" style="margin-top: 20px; padding: 16px; background-color: #fef2f2; border-radius: 8px;">
            <h4 style="font-size: 14px; color: #991b1b; margin-bottom: 4px;">拒绝原因</h4>
            <p style="color: #991b1b;">{{ selectedBooking.rejectReason }}</p>
          </div>

          <div class="modal-footer" style="margin: 20px -24px -24px; padding: 16px 24px;">
            <button type="button" class="btn btn-secondary" (click)="closeDetailModal()">关闭</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  rooms: Room[] = [];
  loading = false;

  filterRoomId: number | string = '';
  filterStatus = '';
  filterStartDate = '';
  filterEndDate = '';
  filterApplicant = '';

  showDetailModal = false;
  selectedBooking: Booking | null = null;

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadBookings();
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        this.rooms = data;
      },
      error: (err) => console.error('加载会议室失败:', err)
    });
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        this.filteredBookings = [...this.bookings];
        this.loading = false;
      },
      error: (err) => {
        console.error('加载预约失败:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      if (this.filterRoomId && booking.room.id !== Number(this.filterRoomId)) {
        return false;
      }

      if (this.filterStatus && booking.status !== this.filterStatus) {
        return false;
      }

      if (this.filterStartDate) {
        const bookingDate = new Date(booking.startTime);
        const filterDate = new Date(this.filterStartDate);
        filterDate.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate < filterDate) {
          return false;
        }
      }

      if (this.filterEndDate) {
        const bookingDate = new Date(booking.startTime);
        const filterDate = new Date(this.filterEndDate);
        filterDate.setHours(23, 59, 59, 999);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate > filterDate) {
          return false;
        }
      }

      if (this.filterApplicant && 
          !booking.applicantName.toLowerCase().includes(this.filterApplicant.toLowerCase()) &&
          !booking.applicantEmail.toLowerCase().includes(this.filterApplicant.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  resetFilters(): void {
    this.filterRoomId = '';
    this.filterStatus = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterApplicant = '';
    this.filteredBookings = [...this.bookings];
  }

  viewDetails(booking: Booking): void {
    this.selectedBooking = booking;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBooking = null;
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': '待审核',
      'APPROVED': '已批准',
      'REJECTED': '已拒绝',
      'CANCELLED': '已取消'
    };
    return statusMap[status] || status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
}
