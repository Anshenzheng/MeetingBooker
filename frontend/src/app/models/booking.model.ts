import { Room } from './room.model';

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  id: number;
  room: Room;
  applicantName: string;
  applicantEmail: string;
  meetingTitle: string;
  description: string;
  participants: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  rejectReason: string;
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreate {
  roomId: number;
  applicantName: string;
  applicantEmail: string;
  meetingTitle: string;
  description: string;
  participants: number;
  startTime: string;
  endTime: string;
}

export interface ApproveRequest {
  approvedBy: string;
}

export interface RejectRequest {
  rejectReason: string;
}
