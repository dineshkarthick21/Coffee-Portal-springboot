package com.javabite.repository;

import com.javabite.entity.Booking;
import com.javabite.entity.CoffeeTable;
import com.javabite.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUser(User user);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByStatusIn(List<Booking.BookingStatus> statuses);

    long countByUser_IdAndStatusIn(String userId, List<Booking.BookingStatus> statuses);

    List<Booking> findByUser_IdAndStatusInOrderByCreatedAtDesc(String userId, List<Booking.BookingStatus> statuses);

    List<Booking> findByTable_IdAndBookingDateAndSlotAndStatusIn(
            String tableId, LocalDate date, String slot, List<Booking.BookingStatus> statuses);

    List<Booking> findByBookingDateAndSlotAndStatusIn(
            LocalDate date, String slot, List<Booking.BookingStatus> statuses);

    List<Booking> findByBookingDateBetweenOrderByBookingDateAscSlotAsc(
            LocalDate startDate, LocalDate endDate);

    List<Booking> findByBookingDateAndStatusInOrderBySlotAsc(
            LocalDate today, List<Booking.BookingStatus> statuses);

    List<Booking> findByStatusAndBookingDate(
            Booking.BookingStatus status, LocalDate date);

    long countByUserId(String userId);

    List<Booking> findByUser_Id(String userId);

    // Additional helper methods
    default List<Booking> findActiveBooking(String userId) {
        return findByUser_IdAndStatusInOrderByCreatedAtDesc(userId,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.IN_PROGRESS));
    }

    default long countActiveBookings(String userId, List<Booking.BookingStatus> statuses) {
        return countByUser_IdAndStatusIn(userId, statuses);
    }

    default List<Booking> findConflicts(String tableId, LocalDate date, String slot) {
        return findByTable_IdAndBookingDateAndSlotAndStatusIn(tableId, date, slot,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.IN_PROGRESS));
    }

    default List<Booking> findConflictsByDateAndSlot(LocalDate date, String slot) {
        return findByBookingDateAndSlotAndStatusIn(date, slot,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.IN_PROGRESS));
    }
}