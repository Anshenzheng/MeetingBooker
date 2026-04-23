import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookingCreate, ApproveRequest, RejectRequest, BookingStatus } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  getPendingBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/pending`);
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  getBookingsByRoom(roomId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/room/${roomId}`);
  }

  getBookingsByStatus(status: BookingStatus): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/status/${status}`);
  }

  getBookingsByDateRange(start: string, end: string): Observable<Booking[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<Booking[]>(`${this.apiUrl}/date-range`, { params });
  }

  getBookingsByRoomAndDateRange(roomId: number, start: string, end: string): Observable<Booking[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<Booking[]>(`${this.apiUrl}/room/${roomId}/date-range`, { params });
  }

  createBooking(booking: BookingCreate): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  updateBooking(id: number, booking: BookingCreate): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, booking);
  }

  approveBooking(id: number, approveBy: string): Observable<Booking> {
    const request: ApproveRequest = { approvedBy: approveBy };
    return this.http.post<Booking>(`${this.apiUrl}/${id}/approve`, request);
  }

  rejectBooking(id: number, rejectReason: string): Observable<Booking> {
    const request: RejectRequest = { rejectReason: rejectReason };
    return this.http.post<Booking>(`${this.apiUrl}/${id}/reject`, request);
  }

  cancelBooking(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
