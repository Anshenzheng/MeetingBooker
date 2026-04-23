import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomCreate } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:8080/api/rooms';

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getActiveRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/active`);
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  createRoom(room: RoomCreate): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  updateRoom(id: number, room: RoomCreate): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activateRoom(id: number): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateRoom(id: number): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
