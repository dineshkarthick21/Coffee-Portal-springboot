package com.javabite.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private String userId;
    private BigDecimal totalAmount; // Add this field
    private String specialInstructions;
    private List<OrderItemRequest> orderItems;
}