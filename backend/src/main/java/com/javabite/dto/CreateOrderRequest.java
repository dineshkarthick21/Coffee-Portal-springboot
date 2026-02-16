package com.javabite.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String bookingId;
    private String specialInstructions;
    private List<OrderItemRequest> items;
}