package com.meetingbooker.controller;

import com.meetingbooker.dto.ApproveRequestDTO;
import com.meetingbooker.dto.BookingDTO;
import com.meetingbooker.dto.RejectRequestDTO;
import com.meetingbooker.entity.Booking;
import com.meetingbooker.entity.Room;
import com.meetingbooker.entity.User;
import com.meetingbooker.repository.RoomRepository;
import com.meetingbooker.service.AuthService;
import com.meetingbooker.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        return ResponseEntity.ok(bookingService.getPendingBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Booking>> getBookingsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(bookingService.getBookingsByRoom(roomId));
    }

    @GetMapping("/applicant/{name}")
    public ResponseEntity<List<Booking>> getBookingsByApplicant(@PathVariable String name) {
        return ResponseEntity.ok(bookingService.getBookingsByApplicant(name));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable Booking.BookingStatus status) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Booking>> getBookingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(bookingService.getBookingsByDateRange(start, end));
    }

    @GetMapping("/room/{roomId}/date-range")
    public ResponseEntity<List<Booking>> getBookingsByRoomAndDateRange(
            @PathVariable Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(bookingService.getBookingsByRoomAndDateRange(roomId, start, end));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingDTO bookingDTO) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Booking booking = convertToEntity(bookingDTO);
        booking.setApplicantName(currentUser.getName());
        booking.setApplicantEmail(currentUser.getEmail());
        
        Booking createdBooking = bookingService.createBooking(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @Valid @RequestBody BookingDTO bookingDTO) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Booking booking = convertToEntity(bookingDTO);
        booking.setApplicantName(currentUser.getName());
        booking.setApplicantEmail(currentUser.getEmail());
        
        Booking updatedBooking = bookingService.updateBooking(id, booking);
        return ResponseEntity.ok(updatedBooking);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id, @Valid @RequestBody ApproveRequestDTO approveRequest) {
        User currentUser = authService.getCurrentUser();
        String approver = currentUser != null ? currentUser.getName() : approveRequest.getApprovedBy();
        Booking booking = bookingService.approveBooking(id, approver);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long id, @Valid @RequestBody RejectRequestDTO rejectRequest) {
        Booking booking = bookingService.rejectBooking(id, rejectRequest.getRejectReason());
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Booking booking = bookingService.getBookingById(id)
                .orElseThrow(() -> new RuntimeException("预约不存在"));
        
        boolean isCreator = booking.getApplicantEmail().equals(currentUser.getEmail());
        boolean isAdmin = authService.isCurrentUserAdmin();
        
        if (!isCreator && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Booking cancelledBooking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(cancelledBooking);
    }

    private Booking convertToEntity(BookingDTO bookingDTO) {
        Booking booking = new Booking();
        booking.setApplicantName(bookingDTO.getApplicantName());
        booking.setApplicantEmail(bookingDTO.getApplicantEmail());
        booking.setMeetingTitle(bookingDTO.getMeetingTitle());
        booking.setDescription(bookingDTO.getDescription());
        booking.setParticipants(bookingDTO.getParticipants());
        booking.setStartTime(bookingDTO.getStartTime());
        booking.setEndTime(bookingDTO.getEndTime());
        
        if (bookingDTO.getRoomId() != null) {
            Room room = roomRepository.findById(bookingDTO.getRoomId())
                    .orElseThrow(() -> new RuntimeException("会议室不存在"));
            booking.setRoom(room);
        }
        
        return booking;
    }
}
