package com.javabite.dto;

import lombok.Data;

@Data
public class UpdateFeedbackStatusRequest {
    private String status;
    private String adminNotes;
}