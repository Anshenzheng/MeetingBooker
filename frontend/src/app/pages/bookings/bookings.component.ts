import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { Booking, BookingStatus, BookingCreate } from '../../models/booking.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">预约审核</h1>
      <p class="page-subtitle">查看和审核会议室预约申请，管理预约状态</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">待审核预约</div>
        <div class="stat-value" style="color: #f59e0b;">{{ stats.pending }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已批准预约</div>
        <div class="stat-value" style="color: #10b981;">{{ stats.approved }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已拒绝预约</div>
        <div class="stat-value" style="color: #ef4444;">{{ stats.rejected }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已取消预约</div>
        <div class="stat-value" style="color: #6b7280;">{{ stats.cancelled }}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">预约申请列表</h2>
        <button class="btn btn-primary" (click)="openCreateModal()">+ 新建预约</button>
      </div>

      <!-- 过滤器 -->
      <div class="filter-bar">
        <div class="filter-item">
          <label class="filter-label">状态筛选</label>
          <select class="filter-select" [(ngModel)]="filterStatus" (change)="applyFilter()">
            <option value="">全部状态</option>
            <option value="PENDING">待审核</option>
            <option value="APPROVED">已批准</option>
            <option value="REJECTED">已拒绝</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!loading && filteredBookings.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">暂无预约申请</div>
        <div class="empty-state-hint">点击上方按钮创建新的预约</div>
      </div>

      <div *ngIf="!loading && filteredBookings.length > 0" class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>会议室</th>
              <th>会议主题</th>
              <th>申请人</th>
              <th>参会人数</th>
              <th>预约时间</th>
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
              <td>{{ booking.applicantName }}</td>
              <td>{{ booking.participants }} 人</td>
              <td>
                <div style="font-size: 13px;">
                  <div>{{ formatDate(booking.startTime) }}</div>
                  <div style="color: #6b7280;">{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</div>
                </div>
              </td>
              <td>
                <span [class]="'status-badge status-' + booking.status.toLowerCase()">
                  {{ getStatusText(booking.status) }}
                </span>
              </td>
              <td>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button *ngIf="booking.status === 'PENDING'" class="btn btn-success btn-sm" (click)="approveBooking(booking)">批准</button>
                  <button *ngIf="booking.status === 'PENDING'" class="btn btn-danger btn-sm" (click)="openRejectModal(booking)">拒绝</button>
                  <button *ngIf="booking.status === 'PENDING'" class="btn btn-outline btn-sm" (click)="viewDetails(booking)">详情</button>
                  <button *ngIf="booking.status !== 'PENDING'" class="btn btn-outline btn-sm" (click)="viewDetails(booking)">查看</button>
                  <button *ngIf="booking.status === 'PENDING' || booking.status === 'APPROVED'" class="btn btn-outline btn-sm" (click)="cancelBooking(booking)">取消</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建预约模态框 -->
    <div *ngIf="showCreateModal" class="modal-overlay" (click)="closeCreateModal()">
      <div class="modal modal-large fade-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">新建预约</h3>
          <button class="modal-close" (click)="closeCreateModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="bookingForm" (ngSubmit)="createBooking()">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">选择会议室 *</label>
                <select class="form-control" formControlName="roomId">
                  <option value="">请选择会议室</option>
                  <option *ngFor="let room of rooms" [value]="room.id">
                    {{ room.roomNumber }} ({{ room.floor }}, 可容纳{{ room.capacity }}人)
                  </option>
                </select>
                <div *ngIf="bookingForm.get('roomId')?.invalid && bookingForm.get('roomId')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  请选择会议室
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">参会人数 *</label>
                <input type="number" class="form-control" formControlName="participants" placeholder="请输入参会人数" min="1">
                <div *ngIf="bookingForm.get('participants')?.invalid && bookingForm.get('participants')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  请输入有效的参会人数
                </div>
                <div *ngIf="capacityError" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  {{ capacityError }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">会议主题 *</label>
              <input type="text" class="form-control" formControlName="meetingTitle" placeholder="请输入会议主题">
              <div *ngIf="bookingForm.get('meetingTitle')?.invalid && bookingForm.get('meetingTitle')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                请输入会议主题
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">申请人姓名 *</label>
                <input type="text" class="form-control" formControlName="applicantName" placeholder="请输入申请人姓名">
                <div *ngIf="bookingForm.get('applicantName')?.invalid && bookingForm.get('applicantName')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  请输入申请人姓名
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">申请人邮箱 *</label>
                <input type="email" class="form-control" formControlName="applicantEmail" placeholder="请输入邮箱地址">
                <div *ngIf="bookingForm.get('applicantEmail')?.invalid && bookingForm.get('applicantEmail')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  请输入有效的邮箱地址
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">开始时间 *</label>
                <input type="datetime-local" class="form-control" formControlName="startTime">
                <div *ngIf="bookingForm.get('startTime')?.invalid && bookingForm.get('startTime')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  请选择开始时间
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">结束时间 *</label>
                <input type="datetime-local" class="form-control" formControlName="endTime">
                <div *ngIf="bookingForm.get('endTime')?.invalid && bookingForm.get('endTime')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  请选择结束时间
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">会议描述</label>
              <textarea class="form-control" formControlName="description" rows="3" placeholder="请输入会议描述（可选）"></textarea>
            </div>

            <div *ngIf="createErrorMessage" style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-bottom: 16px; color: #991b1b; font-size: 14px;">
              {{ createErrorMessage }}
            </div>

            <div class="modal-footer" style="margin: 0 -24px -24px; padding: 16px 24px;">
              <button type="button" class="btn btn-outline" (click)="closeCreateModal()">取消</button>
              <button type="submit" class="btn btn-primary" [disabled]="bookingForm.invalid || submitting">
                {{ submitting ? '提交中...' : '提交预约' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 拒绝模态框 -->
    <div *ngIf="showRejectModal" class="modal-overlay" (click)="closeRejectModal()">
      <div class="modal fade-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">拒绝预约</h3>
          <button class="modal-close" (click)="closeRejectModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="rejectForm" (ngSubmit)="submitReject()">
            <div class="form-group">
              <label class="form-label">拒绝原因 *</label>
              <textarea class="form-control" formControlName="rejectReason" rows="4" placeholder="请输入拒绝原因"></textarea>
              <div *ngIf="rejectForm.get('rejectReason')?.invalid && rejectForm.get('rejectReason')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                请输入拒绝原因
              </div>
            </div>

            <div class="modal-footer" style="margin: 0 -24px -24px; padding: 16px 24px;">
              <button type="button" class="btn btn-outline" (click)="closeRejectModal()">取消</button>
              <button type="submit" class="btn btn-danger" [disabled]="rejectForm.invalid">确认拒绝</button>
            </div>
          </form>
        </div>
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
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  rooms: Room[] = [];
  loading = false;
  filterStatus = '';
  showCreateModal = false;
  showRejectModal = false;
  showDetailModal = false;
  selectedBooking: Booking | null = null;
  submitting = false;
  createErrorMessage = '';
  capacityError = '';

  stats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  };

  bookingForm: FormGroup;
  rejectForm: FormGroup;

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      roomId: ['', Validators.required],
      meetingTitle: ['', Validators.required],
      applicantName: ['', Validators.required],
      applicantEmail: ['', [Validators.required, Validators.email]],
      participants: [1, [Validators.required, Validators.min(1)]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      description: ['']
    });

    this.rejectForm = this.fb.group({
      rejectReason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRooms();
    this.loadBookings();
  }

  loadRooms(): void {
    this.roomService.getActiveRooms().subscribe({
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
        this.bookings = data;
        this.filteredBookings = [...this.bookings];
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('加载预约失败:', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats = {
      pending: this.bookings.filter(b => b.status === BookingStatus.PENDING).length,
      approved: this.bookings.filter(b => b.status === BookingStatus.APPROVED).length,
      rejected: this.bookings.filter(b => b.status === BookingStatus.REJECTED).length,
      cancelled: this.bookings.filter(b => b.status === BookingStatus.CANCELLED).length
    };
  }

  applyFilter(): void {
    if (this.filterStatus) {
      this.filteredBookings = this.bookings.filter(b => b.status === this.filterStatus);
    } else {
      this.filteredBookings = [...this.bookings];
    }
  }

  openCreateModal(): void {
    this.createErrorMessage = '';
    this.capacityError = '';
    this.bookingForm.reset({
      roomId: '',
      meetingTitle: '',
      applicantName: '',
      applicantEmail: '',
      participants: 1,
      startTime: '',
      endTime: '',
      description: ''
    });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createErrorMessage = '';
    this.capacityError = '';
  }

  openRejectModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.rejectForm.reset({ rejectReason: '' });
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedBooking = null;
  }

  viewDetails(booking: Booking): void {
    this.selectedBooking = booking;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBooking = null;
  }

  createBooking(): void {
    if (this.bookingForm.invalid) {
      return;
    }

    const formValue = this.bookingForm.value;
    const roomId = Number(formValue.roomId);
    const participants = Number(formValue.participants);

    const selectedRoom = this.rooms.find(r => r.id === roomId);
    if (selectedRoom && participants > selectedRoom.capacity) {
      this.capacityError = `该会议室最多容纳 ${selectedRoom.capacity} 人，请减少参会人数或选择其他会议室`;
      return;
    }

    this.submitting = true;
    this.createErrorMessage = '';

    const bookingData: BookingCreate = {
      roomId: roomId,
      meetingTitle: formValue.meetingTitle,
      applicantName: formValue.applicantName,
      applicantEmail: formValue.applicantEmail,
      participants: participants,
      startTime: new Date(formValue.startTime).toISOString(),
      endTime: new Date(formValue.endTime).toISOString(),
      description: formValue.description || ''
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: () => {
        this.submitting = false;
        this.closeCreateModal();
        this.loadBookings();
      },
      error: (err) => {
        this.submitting = false;
        this.createErrorMessage = err.error?.message || '创建预约失败，请重试';
      }
    });
  }

  approveBooking(booking: Booking): void {
    if (confirm(`确定要批准预约 "${booking.meetingTitle}" 吗？`)) {
      this.bookingService.approveBooking(booking.id, '管理员').subscribe({
        next: () => this.loadBookings(),
        error: (err) => alert(err.error?.message || '操作失败')
      });
    }
  }

  submitReject(): void {
    if (this.rejectForm.invalid || !this.selectedBooking) {
      return;
    }

    this.bookingService.rejectBooking(this.selectedBooking.id, this.rejectForm.value.rejectReason).subscribe({
      next: () => {
        this.closeRejectModal();
        this.loadBookings();
      },
      error: (err) => alert(err.error?.message || '操作失败')
    });
  }

  cancelBooking(booking: Booking): void {
    if (confirm(`确定要取消预约 "${booking.meetingTitle}" 吗？`)) {
      this.bookingService.cancelBooking(booking.id).subscribe({
        next: () => this.loadBookings(),
        error: (err) => alert(err.error?.message || '操作失败')
      });
    }
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
}
