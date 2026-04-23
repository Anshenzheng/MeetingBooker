package com.meetingbooker.controller;

import com.meetingbooker.dto.RoomDTO;
import com.meetingbooker.entity.Room;
import com.meetingbooker.service.AuthService;
import com.meetingbooker.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:4200")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Room>> getActiveRooms() {
        return ResponseEntity.ok(roomService.getActiveRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/floor/{floor}")
    public ResponseEntity<List<Room>> getRoomsByFloor(@PathVariable String floor) {
        return ResponseEntity.ok(roomService.getRoomsByFloor(floor));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> createRoom(@Valid @RequestBody RoomDTO roomDTO) {
        Room room = convertToEntity(roomDTO);
        Room createdRoom = roomService.createRoom(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomDTO roomDTO) {
        Room room = convertToEntity(roomDTO);
        Room updatedRoom = roomService.updateRoom(id, room);
        return ResponseEntity.ok(updatedRoom);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> activateRoom(@PathVariable Long id) {
        Room room = roomService.activateRoom(id);
        return ResponseEntity.ok(room);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> deactivateRoom(@PathVariable Long id) {
        Room room = roomService.deactivateRoom(id);
        return ResponseEntity.ok(room);
    }

    private Room convertToEntity(RoomDTO roomDTO) {
        Room room = new Room();
        room.setFloor(roomDTO.getFloor());
        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setCapacity(roomDTO.getCapacity());
        room.setEquipment(roomDTO.getEquipment());
        room.setDescription(roomDTO.getDescription());
        room.setIsActive(roomDTO.getIsActive() != null ? roomDTO.getIsActive() : true);
        return room;
    }
}
