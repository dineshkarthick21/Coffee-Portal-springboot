package com.javabite.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FeedbackResponse {
    private String id;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String orderId;
    private Integer rating;
    private String comment;
    private String category;
    private String status;
    private LocalDateTime createdAt;
    private String adminNotes;
}