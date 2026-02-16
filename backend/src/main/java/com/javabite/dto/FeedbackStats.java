package com.javabite.dto;

import lombok.Data;
import java.util.Map;

@Data
public class FeedbackStats {
    private Long totalFeedback;
    private Double averageRating;
    private Map<String, Long> statusCount;
    private Map<String, Long> categoryCount;
    private Long pendingCount;
    private Long resolvedCount;
}