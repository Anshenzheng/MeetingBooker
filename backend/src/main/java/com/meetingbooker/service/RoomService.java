package com.meetingbooker.service;

import com.meetingbooker.entity.Room;
import com.meetingbooker.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getActiveRooms() {
        return roomRepository.findByIsActiveTrue();
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public Optional<Room> getRoomByNumber(String roomNumber) {
        return roomRepository.findByRoomNumber(roomNumber);
    }

    public List<Room> getRoomsByFloor(String floor) {
        return roomRepository.findByFloorOrderByRoomNumber(floor);
    }

    public List<Room> getRoomsByCapacity(Integer capacity) {
        return roomRepository.findByCapacityGreaterThanEqual(capacity);
    }

    @Transactional
    public Room createRoom(Room room) {
        if (roomRepository.findByRoomNumber(room.getRoomNumber()).isPresent()) {
            throw new RuntimeException("会议室编号已存在: " + room.getRoomNumber());
        }
        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(Long id, Room roomDetails) {
        return roomRepository.findById(id)
                .map(room -> {
                    if (!room.getRoomNumber().equals(roomDetails.getRoomNumber())) {
                        roomRepository.findByRoomNumber(roomDetails.getRoomNumber())
                                .ifPresent(existing -> {
                                    throw new RuntimeException("会议室编号已存在: " + roomDetails.getRoomNumber());
                                });
                    }
                    room.setFloor(roomDetails.getFloor());
                    room.setRoomNumber(roomDetails.getRoomNumber());
                    room.setCapacity(roomDetails.getCapacity());
                    room.setEquipment(roomDetails.getEquipment());
                    room.setDescription(roomDetails.getDescription());
                    room.setIsActive(roomDetails.getIsActive());
                    return roomRepository.save(room);
                })
                .orElseThrow(() -> new RuntimeException("会议室不存在，ID: " + id));
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("会议室不存在，ID: " + id));
        room.setIsActive(false);
        roomRepository.save(room);
    }

    @Transactional
    public Room activateRoom(Long id) {
        return roomRepository.findById(id)
                .map(room -> {
                    room.setIsActive(true);
                    return roomRepository.save(room);
                })
                .orElseThrow(() -> new RuntimeException("会议室不存在，ID: " + id));
    }

    @Transactional
    public Room deactivateRoom(Long id) {
        return roomRepository.findById(id)
                .map(room -> {
                    room.setIsActive(false);
                    return roomRepository.save(room);
                })
                .orElseThrow(() -> new RuntimeException("会议室不存在，ID: " + id));
    }
}
