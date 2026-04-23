import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { Room, RoomCreate } from '../../models/room.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">会议室管理</h1>
      <p class="page-subtitle">管理所有会议室信息，包括楼层、编号、容纳人数等配置</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">会议室列表</h2>
        <button class="btn btn-primary" (click)="openCreateModal()">+ 添加会议室</button>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!loading && rooms.length === 0" class="empty-state">
        <div class="empty-state-icon">🏢</div>
        <div class="empty-state-text">暂无会议室</div>
        <div class="empty-state-hint">点击上方按钮添加第一个会议室</div>
      </div>

      <div *ngIf="!loading && rooms.length > 0" class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>楼层</th>
              <th>会议室编号</th>
              <th>容纳人数</th>
              <th>配套设备</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let room of rooms">
              <td>{{ room.floor }}</td>
              <td><strong>{{ room.roomNumber }}</strong></td>
              <td>{{ room.capacity }} 人</td>
              <td>{{ room.equipment || '无' }}</td>
              <td>
                <span [class]="'status-badge ' + (room.isActive ? 'status-approved' : 'status-cancelled')">
                  {{ room.isActive ? '启用' : '停用' }}
                </span>
              </td>
              <td>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-outline btn-sm" (click)="openEditModal(room)">编辑</button>
                  <button *ngIf="room.isActive" class="btn btn-danger btn-sm" (click)="toggleStatus(room)">停用</button>
                  <button *ngIf="!room.isActive" class="btn btn-success btn-sm" (click)="toggleStatus(room)">启用</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 模态框 -->
    <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
      <div class="modal fade-in" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '编辑会议室' : '添加会议室' }}</h3>
          <button class="modal-close" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">楼层 *</label>
              <input type="text" class="form-control" formControlName="floor" placeholder="例如：1F, 2F">
              <div *ngIf="roomForm.get('floor')?.invalid && roomForm.get('floor')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                请输入楼层
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">会议室编号 *</label>
              <input type="text" class="form-control" formControlName="roomNumber" placeholder="例如：101, 201">
              <div *ngIf="roomForm.get('roomNumber')?.invalid && roomForm.get('roomNumber')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                请输入会议室编号
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">容纳人数 *</label>
              <input type="number" class="form-control" formControlName="capacity" placeholder="请输入容纳人数" min="1">
              <div *ngIf="roomForm.get('capacity')?.invalid && roomForm.get('capacity')?.touched" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                请输入有效的容纳人数
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">配套设备</label>
              <input type="text" class="form-control" formControlName="equipment" placeholder="例如：投影仪、白板、音响系统">
            </div>

            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea class="form-control" formControlName="description" rows="3" placeholder="会议室描述说明"></textarea>
            </div>

            <div *ngIf="errorMessage" style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-bottom: 16px; color: #991b1b; font-size: 14px;">
              {{ errorMessage }}
            </div>

            <div class="modal-footer" style="margin: 0 -24px -24px; padding: 16px 24px;">
              <button type="button" class="btn btn-outline" (click)="closeModal()">取消</button>
              <button type="submit" class="btn btn-primary" [disabled]="roomForm.invalid || submitting">
                {{ submitting ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  loading = false;
  showModal = false;
  isEdit = false;
  editRoomId: number | null = null;
  submitting = false;
  errorMessage = '';

  roomForm: FormGroup;

  constructor(
    private roomService: RoomService,
    private fb: FormBuilder
  ) {
    this.roomForm = this.fb.group({
      floor: ['', Validators.required],
      roomNumber: ['', Validators.required],
      capacity: [1, [Validators.required, Validators.min(1)]],
      equipment: [''],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;
    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('加载会议室失败:', err);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEdit = false;
    this.editRoomId = null;
    this.errorMessage = '';
    this.roomForm.reset({
      floor: '',
      roomNumber: '',
      capacity: 1,
      equipment: '',
      description: '',
      isActive: true
    });
    this.showModal = true;
  }

  openEditModal(room: Room): void {
    this.isEdit = true;
    this.editRoomId = room.id;
    this.errorMessage = '';
    this.roomForm.patchValue({
      floor: room.floor,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      equipment: room.equipment || '',
      description: room.description || '',
      isActive: room.isActive
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const roomData: RoomCreate = this.roomForm.value;

    if (this.isEdit && this.editRoomId) {
      this.roomService.updateRoom(this.editRoomId, roomData).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadRooms();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || '更新失败，请重试';
        }
      });
    } else {
      this.roomService.createRoom(roomData).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadRooms();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || '创建失败，请重试';
        }
      });
    }
  }

  toggleStatus(room: Room): void {
    const action = room.isActive ? '停用' : '启用';
    if (confirm(`确定要${action}会议室 ${room.roomNumber} 吗？`)) {
      if (room.isActive) {
        this.roomService.deactivateRoom(room.id).subscribe({
          next: () => this.loadRooms(),
          error: (err) => alert(err.error?.message || '操作失败')
        });
      } else {
        this.roomService.activateRoom(room.id).subscribe({
          next: () => this.loadRooms(),
          error: (err) => alert(err.error?.message || '操作失败')
        });
      }
    }
  }
}
