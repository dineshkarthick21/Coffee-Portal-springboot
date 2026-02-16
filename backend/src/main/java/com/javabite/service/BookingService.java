package com.javabite.service;

import com.javabite.entity.Booking;
import com.javabite.entity.CoffeeTable;
import com.javabite.entity.User;
import com.javabite.repository.BookingRepository;
import com.javabite.repository.CoffeeTableRepository;
import com.javabite.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CoffeeTableRepository tableRepository;
    private final UserRepository userRepository;

    // -------------------------------------------
    // ✅ Create Booking (date + slot system)
    // -------------------------------------------
    public Booking createBooking(Booking request) {

        String userId = request.getUser().getId();

        long active = bookingRepository.countActiveBookings(
                userId,
                List.of(
                        Booking.BookingStatus.PENDING,
                        Booking.BookingStatus.CONFIRMED,
                        Booking.BookingStatus.IN_PROGRESS
                )
        );

        if (active > 0) {
            throw new RuntimeException("You already have an active booking.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CoffeeTable table = tableRepository.findById(request.getTable().getId())
                .orElseThrow(() -> new RuntimeException("Table not found"));

        if (table.getStatus() != CoffeeTable.TableStatus.AVAILABLE) {
            throw new RuntimeException("Table is not available.");
        }

        // ✅ conflict check (date + slot)
        List<Booking> conflicts = bookingRepository.findConflicts(
                table.getId(),
                request.getBookingDate(),
                request.getSlot()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("This table is already booked for that slot.");
        }

        // ✅ Prepare and save booking
        request.setUser(user);
        request.setStatus(Booking.BookingStatus.PENDING);
        request.setCreatedAt(java.time.LocalDateTime.now());

        table.setStatus(CoffeeTable.TableStatus.RESERVED);
        tableRepository.save(table);

        return bookingRepository.save(request);
    }

    // -------------------------------------------
    // ✅ Cancel booking
    // -------------------------------------------
    public Booking cancelBooking(String id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        b.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(b);

        CoffeeTable t = b.getTable();
        t.setStatus(CoffeeTable.TableStatus.AVAILABLE);
        tableRepository.save(t);

        return b;
    }

    // -------------------------------------------
    // ✅ Check-in
    // -------------------------------------------
    public Booking checkIn(String id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        b.setStatus(Booking.BookingStatus.IN_PROGRESS);
        bookingRepository.save(b);

        CoffeeTable t = b.getTable();
        t.setStatus(CoffeeTable.TableStatus.OCCUPIED);
        tableRepository.save(t);

        return b;
    }

    // -------------------------------------------
    // ✅ Check-out
    // -------------------------------------------
    public Booking checkOut(String id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        b.setStatus(Booking.BookingStatus.COMPLETED);
        bookingRepository.save(b);

        CoffeeTable t = b.getTable();
        t.setStatus(CoffeeTable.TableStatus.AVAILABLE);
        tableRepository.save(t);

        return b;
    }

    // -------------------------------------------
    // ✅ Get available tables for given date + slot
    // -------------------------------------------
    public List<CoffeeTable> getAvailableTables(Integer minCapacity, LocalDate date, String slot) {

        List<CoffeeTable> all = tableRepository.findAvailableTablesByCapacity(minCapacity);

        return all.stream()
                .filter(t -> bookingRepository.findConflicts(t.getId(), date, slot).isEmpty())
                .toList();
    }
}
