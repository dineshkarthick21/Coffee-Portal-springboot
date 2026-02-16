package com.javabite.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    @DBRef
    @JsonIgnoreProperties({"password", "resetToken", "tokenExpiry"})
    private User user;

    @DBRef
    @JsonIgnoreProperties({"orders"})
    private CoffeeTable table;

    @DBRef
    @JsonIgnoreProperties({"orders"})
    private Booking booking;

    private OrderStatus status;

    private BigDecimal totalAmount;

    private String specialInstructions;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @DBRef
    @JsonIgnoreProperties({"order"})
    private Payment payment;

    @DBRef
    @JsonIgnoreProperties({"order"})
    private List<OrderItem> orderItems = new ArrayList<>();

    public enum OrderStatus {
        PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED
    }
}