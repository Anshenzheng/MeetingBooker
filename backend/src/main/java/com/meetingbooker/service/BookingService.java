package com.meetingbooker.service;

import com.meetingbooker.entity.Booking;
import com.meetingbooker.entity.Room;
import com.meetingbooker.repository.BookingRepository;
import com.meetingbooker.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    private static final List<Booking.BookingStatus> CONFLICT_STATUSES = 
            Arrays.asList(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED);

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByRoom(Long roomId) {
        return bookingRepository.findByRoomIdOrderByStartTimeAsc(roomId);
    }

    public List<Booking> getBookingsByApplicant(String applicantName) {
        return bookingRepository.findByApplicantNameOrderByStartTimeAsc(applicantName);
    }

    public List<Booking> getBookingsByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatusOrderByStartTimeAsc(status);
    }

    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatusOrderByStartTimeAsc(Booking.BookingStatus.PENDING);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getBookingsByDateRange(LocalDateTime start, LocalDateTime end) {
        return bookingRepository.findByStartTimeBetweenOrderByStartTimeAsc(start, end);
    }

    public List<Booking> getBookingsByRoomAndDateRange(Long roomId, LocalDateTime start, LocalDateTime end) {
        return bookingRepository.findByRoomIdAndStartTimeBetweenOrderByStartTimeAsc(roomId, start, end);
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        validateBookingTime(booking);
        validateRoomCapacity(booking);
        
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getRoom(),
                booking.getStartTime(),
                booking.getEndTime(),
                CONFLICT_STATUSES
        );
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("该时间段已有预约或待审核的预约存在，请选择其他时间");
        }
        
        booking.setStatus(Booking.BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBooking(Long id, Booking bookingDetails) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                        throw new RuntimeException("只能修改待审核状态的预约");
                    }
                    
                    validateBookingTime(bookingDetails);
                    
                    if (bookingDetails.getRoom() != null) {
                        Room room = roomRepository.findById(bookingDetails.getRoom().getId())
                                .orElseThrow(() -> new RuntimeException("会议室不存在"));
                        booking.setRoom(room);
                    }
                    
                    List<Booking> conflicts = bookingRepository.findConflictingBookingsExcludingId(
                            booking.getRoom().getId(),
                            bookingDetails.getStartTime(),
                            bookingDetails.getEndTime(),
                            id
                    );
                    
                    if (!conflicts.isEmpty()) {
                        throw new RuntimeException("该时间段已有预约或待审核的预约存在，请选择其他时间");
                    }
                    
                    booking.setMeetingTitle(bookingDetails.getMeetingTitle());
                    booking.setDescription(bookingDetails.getDescription());
                    booking.setApplicantName(bookingDetails.getApplicantName());
                    booking.setApplicantEmail(bookingDetails.getApplicantEmail());
                    booking.setParticipants(bookingDetails.getParticipants());
                    booking.setStartTime(bookingDetails.getStartTime());
                    booking.setEndTime(bookingDetails.getEndTime());
                    
                    return bookingRepository.save(booking);
                })
                .orElseThrow(() -> new RuntimeException("预约不存在，ID: " + id));
    }

    @Transactional
    public Booking approveBooking(Long id, String approvedBy) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                        throw new RuntimeException("只能审核待审核状态的预约");
                    }
                    
                    List<Booking> conflicts = bookingRepository.findConflictingBookings(
                            booking.getRoom(),
                            booking.getStartTime(),
                            booking.getEndTime(),
                            Arrays.asList(Booking.BookingStatus.APPROVED)
                    );
                    
                    if (!conflicts.isEmpty()) {
                        throw new RuntimeException("该时间段已有已批准的预约存在，无法批准此预约");
                    }
                    
                    booking.setStatus(Booking.BookingStatus.APPROVED);
                    booking.setApprovedBy(approvedBy);
                    booking.setApprovedAt(LocalDateTime.now());
                    return bookingRepository.save(booking);
                })
                .orElseThrow(() -> new RuntimeException("预约不存在，ID: " + id));
    }

    @Transactional
    public Booking rejectBooking(Long id, String rejectReason) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                        throw new RuntimeException("只能拒绝待审核状态的预约");
                    }
                    booking.setStatus(Booking.BookingStatus.REJECTED);
                    booking.setRejectReason(rejectReason);
                    return bookingRepository.save(booking);
                })
                .orElseThrow(() -> new RuntimeException("预约不存在，ID: " + id));
    }

    @Transactional
    public Booking cancelBooking(Long id) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
                        throw new RuntimeException("该预约已取消");
                    }
                    if (booking.getStartTime().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("无法取消已过期的预约");
                    }
                    booking.setStatus(Booking.BookingStatus.CANCELLED);
                    return bookingRepository.save(booking);
                })
                .orElseThrow(() -> new RuntimeException("预约不存在，ID: " + id));
    }

    private void validateBookingTime(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        
        if (booking.getStartTime().isBefore(now)) {
            throw new RuntimeException("预约开始时间不能早于当前时间");
        }
        
        if (booking.getEndTime().isBefore(booking.getStartTime())) {
            throw new RuntimeException("结束时间必须晚于开始时间");
        }
        
        if (booking.getEndTime().isEqual(booking.getStartTime())) {
            throw new RuntimeException("开始时间和结束时间不能相同");
        }
    }

    private void validateRoomCapacity(Booking booking) {
        Room room = roomRepository.findById(booking.getRoom().getId())
                .orElseThrow(() -> new RuntimeException("会议室不存在"));
        
        if (booking.getParticipants() > room.getCapacity()) {
            throw new RuntimeException("参会人数超过会议室容量，该会议室最多容纳 " + room.getCapacity() + " 人");
        }
    }
}
