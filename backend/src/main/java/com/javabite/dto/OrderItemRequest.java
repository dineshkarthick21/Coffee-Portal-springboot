package com.javabite.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
    private String menuItemId;
    private Integer quantity;
    private String specialInstructions;
}
