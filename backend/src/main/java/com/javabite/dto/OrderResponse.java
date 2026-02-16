package com.javabite.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private String id;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private String bookingId;
    private List<OrderItemResponse> orderItems;

    // Add these fields for all roles
    private UserResponse user;
    private TableResponse table;

    // OrderStatus enum
    public enum OrderStatus {
        PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED
    }

    // User information
    @Data
    @Builder
    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        private String phone;
    }

    // Table information
    @Data
    @Builder
    public static class TableResponse {
        private String id;
        private String tableNumber;
        private Integer capacity;
        private String status;
    }
}