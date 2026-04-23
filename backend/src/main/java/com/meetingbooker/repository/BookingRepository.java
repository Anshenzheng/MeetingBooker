package com.meetingbooker.repository;

import com.meetingbooker.entity.Booking;
import com.meetingbooker.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByRoomIdOrderByStartTimeAsc(Long roomId);
    
    List<Booking> findByApplicantNameOrderByStartTimeAsc(String applicantName);
    
    List<Booking> findByStatusOrderByStartTimeAsc(Booking.BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.room = :room AND b.status IN :statuses " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(@Param("room") Room room,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime,
                                           @Param("statuses") List<Booking.BookingStatus> statuses);
    
    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND " +
           "((b.startTime < :endTime AND b.endTime > :startTime)) AND b.id != :excludeId")
    List<Booking> findConflictingBookingsExcludingId(@Param("roomId") Long roomId,
                                                       @Param("startTime") LocalDateTime startTime,
                                                       @Param("endTime") LocalDateTime endTime,
                                                       @Param("excludeId") Long excludeId);
    
    List<Booking> findByStartTimeBetweenOrderByStartTimeAsc(LocalDateTime start, LocalDateTime end);
    
    List<Booking> findByRoomIdAndStartTimeBetweenOrderByStartTimeAsc(Long roomId, LocalDateTime start, LocalDateTime end);
}
