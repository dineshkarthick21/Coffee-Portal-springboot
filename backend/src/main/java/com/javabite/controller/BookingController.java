package com.javabite.controller;

import com.javabite.entity.Booking;
import com.javabite.entity.CoffeeTable;
import com.javabite.entity.User;
import com.javabite.repository.BookingRepository;
import com.javabite.repository.CoffeeTableRepository;
import com.javabite.repository.UserRepository;
import com.javabite.service.BookingService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    // ---------------------------------------------------------
    // ✅ Create booking (DATE + SLOT system)
    // ---------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking request) {

        if (request.getBookingDate() == null || request.getSlot() == null) {
            return ResponseEntity.badRequest().body("bookingDate and slot are required.");
        }

        Booking saved = bookingService.createBooking(request);
        return ResponseEntity.ok(saved);
    }

    // ---------------------------------------------------------
    // ✅ Get user's active booking
    // ---------------------------------------------------------
    @GetMapping("/active/{userId}")
    public ResponseEntity<?> getActiveBooking(@PathVariable String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> active = bookingRepository.findActiveBooking(userId);

        if (active.isEmpty()) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(active.get(0)); // latest active booking
    }

    // ---------------------------------------------------------
    // ✅ Cancel booking
    // ---------------------------------------------------------
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId));
    }

    // ---------------------------------------------------------
    // ✅ Get available tables (DATE + SLOT)
    // ---------------------------------------------------------
    @GetMapping("/available")
    public ResponseEntity<List<CoffeeTable>> getAvailableTables(
            @RequestParam Integer minCapacity,
            @RequestParam String bookingDate,
            @RequestParam String slot) {

        LocalDate date = LocalDate.parse(bookingDate);

        List<CoffeeTable> tables =
                bookingService.getAvailableTables(minCapacity, date, slot);

        return ResponseEntity.ok(tables);
    }
}
