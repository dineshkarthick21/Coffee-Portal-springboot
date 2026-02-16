package com.javabite.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private CoffeeTable table;

    private LocalDate bookingDate;

    private LocalTime bookingTime;

    private String slot;

    private Integer duration = 2;

    private Integer numberOfGuests;

    private BookingStatus status;

    private String specialRequests;

    private BigDecimal totalAmount;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @DBRef
    private List<Order> orders = new ArrayList<>();

    public enum BookingStatus {
        PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
    }
}