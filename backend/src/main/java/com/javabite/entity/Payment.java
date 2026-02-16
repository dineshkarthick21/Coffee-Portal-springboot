package com.javabite.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;

    @DBRef
    private Order order;

    private BigDecimal amount;

    private PaymentMethod method;

    private String transactionId;
    private Boolean success = false;

    // Razorpay fields
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Builder.Default
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PaymentMethod {
        CASH, CARD, UPI, NET_BANKING, RAZORPAY
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED
    }
}