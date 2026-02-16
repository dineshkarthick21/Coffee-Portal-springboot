// src/main/java/com/javabite/repository/FeedbackRepository.java
package com.javabite.repository;

import com.javabite.entity.Feedback;
import com.javabite.entity.FeedbackCategory;
import com.javabite.entity.FeedbackStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    List<Feedback> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Feedback> findByStatusOrderByCreatedAtDesc(FeedbackStatus status);

    List<Feedback> findByCategoryOrderByCreatedAtDesc(FeedbackCategory category);

    List<Feedback> findByRatingBetweenOrderByCreatedAtDesc(Integer minRating, Integer maxRating);

    List<Feedback> findByCustomerIdAndStatusOrderByCreatedAtDesc(String customerId, FeedbackStatus status);

    Long countByStatus(FeedbackStatus status);

    List<Feedback> findAllByOrderByCreatedAtDesc();

    List<Feedback> findByStatusAndCategoryOrderByCreatedAtDesc(FeedbackStatus status, FeedbackCategory category);

    List<Feedback> findTop10ByOrderByCreatedAtDesc();

    List<Feedback> findByCommentContainingIgnoreCase(String searchTerm);

    // Helper methods
    default Double findAverageRating() {
        List<Feedback> allFeedback = findAll();
        if (allFeedback.isEmpty()) {
            return 0.0;
        }
        return allFeedback.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
    }

    default List<Object[]> countByCategory() {
        // This would need to be implemented with aggregation
        // For now, returning empty list as placeholder
        return List.of();
    }

    default List<Feedback> searchByComment(String query) {
        return findByCommentContainingIgnoreCase(query);
    }
}