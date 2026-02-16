package com.javabite.dto;

import com.javabite.entity.Booking;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String userId;
    private String userName;
    private String tableId;
    private String tableNumber;     // ✅ This should display table number
    private String tableLocation;   // ✅ This should display table location
    private LocalDate bookingDate;  // ✅ This should display booking date
    private String slot;            // ✅ This should display time slot
    private Integer duration;
    private Integer numberOfGuests;
    private Booking.BookingStatus status;
    private String specialRequests;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;

    public static BookingResponse fromEntity(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .tableId(booking.getTable().getId())
                .tableNumber(booking.getTable().getTableNumber())  // ✅ Make sure this field exists in CoffeeTable
                .tableLocation(booking.getTable().getLocation())    // ✅ Make sure this field exists in CoffeeTable
                .bookingDate(booking.getBookingDate())
                .slot(booking.getSlot())
                .duration(booking.getDuration())
                .numberOfGuests(booking.getNumberOfGuests())
                .status(booking.getStatus())
                .specialRequests(booking.getSpecialRequests())
                .totalAmount(booking.getTotalAmount())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}