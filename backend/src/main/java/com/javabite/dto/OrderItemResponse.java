package com.javabite.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private String id;
    private String menuItemName;
    private String menuItemId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String specialInstructions;
}