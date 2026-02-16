package com.javabite.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {
    private String tableId;
    private LocalDateTime bookingTime;
    private Integer duration;
    private Integer numberOfGuests;
    private String specialRequests;
}