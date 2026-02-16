package com.javabite.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private boolean success;
    private String message;
    private String razorpayOrderId;
    private String paymentId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime paymentDate;
}