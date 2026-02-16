// src/main/java/com/javabite/service/FeedbackService.java
package com.javabite.service;

import com.javabite.dto.*;
import com.javabite.entity.Feedback;
import com.javabite.entity.FeedbackCategory;
import com.javabite.entity.FeedbackStatus;
import com.javabite.entity.User;
import com.javabite.repository.FeedbackRepository;
import com.javabite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Transactional
    public FeedbackResponse submitFeedback(String customerId, FeedbackRequest request) {
        try {
            log.info("Submitting feedback for customer: {}", customerId);

            User customer = userRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

            // Validate category
            FeedbackCategory category;
            try {
                category = FeedbackCategory.valueOf(request.getCategory().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid category: " + request.getCategory() +
                        ". Valid categories: " + Arrays.toString(FeedbackCategory.values()));
            }

            Feedback feedback = new Feedback();
            feedback.setCustomer(customer);
            feedback.setRating(request.getRating());
            feedback.setComment(request.getComment());
            feedback.setCategory(category);
            feedback.setStatus(FeedbackStatus.PENDING);

            Feedback savedFeedback = feedbackRepository.save(feedback);
            log.info("Feedback submitted by customer {} with rating {}", customerId, request.getRating());

            return convertToResponse(savedFeedback);

        } catch (Exception e) {
            log.error("Error submitting feedback for customer {}: {}", customerId, e.getMessage());
            throw new RuntimeException("Failed to submit feedback: " + e.getMessage());
        }
    }

    public List<FeedbackResponse> getCustomerFeedback(String customerId) {
        try {
            log.info("Getting feedback for customer: {}", customerId);
            List<Feedback> feedbackList = feedbackRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
            return feedbackList.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting feedback for customer {}: {}", customerId, e.getMessage());
            throw new RuntimeException("Failed to get customer feedback: " + e.getMessage());
        }
    }

    public List<FeedbackResponse> getAllFeedback(String status, String category) {
        try {
            log.info("Getting all feedback - status: {}, category: {}", status, category);

            List<Feedback> feedbackList;

            if (status != null && !status.trim().isEmpty() && category != null && !category.trim().isEmpty()) {
                // Both status and category provided
                FeedbackStatus statusEnum = parseFeedbackStatus(status);
                FeedbackCategory categoryEnum = parseFeedbackCategory(category);
                feedbackList = feedbackRepository.findByStatusAndCategoryOrderByCreatedAtDesc(statusEnum, categoryEnum);

            } else if (status != null && !status.trim().isEmpty()) {
                // Only status provided
                FeedbackStatus statusEnum = parseFeedbackStatus(status);
                feedbackList = feedbackRepository.findByStatusOrderByCreatedAtDesc(statusEnum);

            } else if (category != null && !category.trim().isEmpty()) {
                // Only category provided
                FeedbackCategory categoryEnum = parseFeedbackCategory(category);
                feedbackList = feedbackRepository.findByCategoryOrderByCreatedAtDesc(categoryEnum);

            } else {
                // No filters provided
                feedbackList = feedbackRepository.findAllByOrderByCreatedAtDesc();
            }

            log.info("Found {} feedback items", feedbackList.size());
            return feedbackList.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting all feedback: {}", e.getMessage());
            throw new RuntimeException("Failed to get feedback: " + e.getMessage());
        }
    }

    public FeedbackResponse getFeedbackById(String id) {
        try {
            Feedback feedback = feedbackRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
            return convertToResponse(feedback);
        } catch (Exception e) {
            log.error("Error getting feedback by id {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to get feedback: " + e.getMessage());
        }
    }

    @Transactional
    public FeedbackResponse updateFeedbackStatus(String id, UpdateFeedbackStatusRequest request) {
        try {
            Feedback feedback = feedbackRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));

            FeedbackStatus newStatus = parseFeedbackStatus(request.getStatus());
            feedback.setStatus(newStatus);
            feedback.setAdminNotes(request.getAdminNotes());

            Feedback updatedFeedback = feedbackRepository.save(feedback);
            log.info("Feedback {} status updated to {}", id, request.getStatus());

            return convertToResponse(updatedFeedback);
        } catch (Exception e) {
            log.error("Error updating feedback status for id {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update feedback status: " + e.getMessage());
        }
    }

    public FeedbackStats getFeedbackStats() {
        try {
            FeedbackStats stats = new FeedbackStats();

            // Total feedback count
            stats.setTotalFeedback(feedbackRepository.count());

            // Average rating
            stats.setAverageRating(feedbackRepository.findAverageRating());

            // Status count
            Map<String, Long> statusCount = Arrays.stream(FeedbackStatus.values())
                    .collect(Collectors.toMap(
                            Enum::name,
                            status -> feedbackRepository.countByStatus(status)
                    ));
            stats.setStatusCount(statusCount);

            // Category count
            List<Object[]> categoryCounts = feedbackRepository.countByCategory();
            Map<String, Long> categoryCount = categoryCounts.stream()
                    .collect(Collectors.toMap(
                            obj -> ((FeedbackCategory) obj[0]).name(),
                            obj -> (Long) obj[1]
                    ));
            stats.setCategoryCount(categoryCount);

            // Specific counts for quick access
            stats.setPendingCount(feedbackRepository.countByStatus(FeedbackStatus.PENDING));
            stats.setResolvedCount(feedbackRepository.countByStatus(FeedbackStatus.RESOLVED));

            log.info("Generated feedback stats: {} total feedback", stats.getTotalFeedback());
            return stats;

        } catch (Exception e) {
            log.error("Error generating feedback stats: {}", e.getMessage());
            throw new RuntimeException("Failed to get feedback statistics: " + e.getMessage());
        }
    }

    public List<FeedbackResponse> searchFeedback(String searchTerm) {
        try {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return getAllFeedback(null, null);
            }

            List<Feedback> feedbackList = feedbackRepository.searchByComment(searchTerm.trim());
            return feedbackList.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching feedback with term '{}': {}", searchTerm, e.getMessage());
            throw new RuntimeException("Failed to search feedback: " + e.getMessage());
        }
    }

    // Helper methods for parsing enums with proper error handling
    private FeedbackStatus parseFeedbackStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException("Status cannot be null or empty");
        }
        try {
            return FeedbackStatus.valueOf(status.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status +
                    ". Valid statuses: " + Arrays.toString(FeedbackStatus.values()));
        }
    }

    private FeedbackCategory parseFeedbackCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            throw new RuntimeException("Category cannot be null or empty");
        }
        try {
            return FeedbackCategory.valueOf(category.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category: " + category +
                    ". Valid categories: " + Arrays.toString(FeedbackCategory.values()));
        }
    }

    private FeedbackResponse convertToResponse(Feedback feedback) {
        try {
            FeedbackResponse response = new FeedbackResponse();
            response.setId(feedback.getId());
            response.setCustomerId(feedback.getCustomer().getId());
            response.setCustomerName(feedback.getCustomer().getName());
            response.setCustomerEmail(feedback.getCustomer().getEmail());
            response.setRating(feedback.getRating());
            response.setComment(feedback.getComment());
            response.setCategory(feedback.getCategory().name());
            response.setStatus(feedback.getStatus().name());
            response.setCreatedAt(feedback.getCreatedAt());
            response.setAdminNotes(feedback.getAdminNotes());

            if (feedback.getOrder() != null) {
                response.setOrderId(feedback.getOrder().getId());
            }

            return response;
        } catch (Exception e) {
            log.error("Error converting feedback to response: {}", e.getMessage());
            throw new RuntimeException("Failed to convert feedback data");
        }
    }

    // Helper method for repository
    public List<Feedback> findAllByOrderByCreatedAtDesc() {
        try {
            return feedbackRepository.findAllByOrderByCreatedAtDesc();
        } catch (Exception e) {
            log.error("Error finding all feedback: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve feedback list");
        }
    }
}