// src/main/java/com/javabite/controller/FeedbackController.java
package com.javabite.controller;

import com.javabite.dto.*;
import com.javabite.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @RequestHeader("X-User-Id") String customerId,
            @Valid @RequestBody FeedbackRequest request) {
        FeedbackResponse response = feedbackService.submitFeedback(customerId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer")
    public ResponseEntity<List<FeedbackResponse>> getCustomerFeedback(
            @RequestHeader("X-User-Id") String customerId) {
        List<FeedbackResponse> feedback = feedbackService.getCustomerFeedback(customerId);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        List<FeedbackResponse> feedback = feedbackService.getAllFeedback(status, category);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable String id) {
        FeedbackResponse feedback = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(feedback);
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<FeedbackResponse> updateFeedbackStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateFeedbackStatusRequest request) {
        FeedbackResponse feedback = feedbackService.updateFeedbackStatus(id, request);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<FeedbackStats> getFeedbackStats() {
        FeedbackStats stats = feedbackService.getFeedbackStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/search")
    public ResponseEntity<List<FeedbackResponse>> searchFeedback(
            @RequestParam String q) {
        List<FeedbackResponse> feedback = feedbackService.searchFeedback(q);
        return ResponseEntity.ok(feedback);
    }
}