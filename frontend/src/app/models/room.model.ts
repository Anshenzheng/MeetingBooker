export interface Room {
  id: number;
  floor: string;
  roomNumber: string;
  capacity: number;
  equipment: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomCreate {
  floor: string;
  roomNumber: string;
  capacity: number;
  equipment: string;
  description: string;
  isActive: boolean;
}
