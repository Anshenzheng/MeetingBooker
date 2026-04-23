package com.meetingbooker.repository;

import com.meetingbooker.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    List<Room> findByIsActiveTrue();
    
    Optional<Room> findByRoomNumber(String roomNumber);
    
    List<Room> findByFloorOrderByRoomNumber(String floor);
    
    List<Room> findByCapacityGreaterThanEqual(Integer capacity);
}
