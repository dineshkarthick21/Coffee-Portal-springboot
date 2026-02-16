// src/main/java/com/javabite/entity/Feedback.java
package com.javabite.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {
    @Id
    private String id;

    @DBRef
    private User customer;

    @DBRef
    private Order order;

    private Integer rating; // 1-5 stars

    private String comment;

    private FeedbackCategory category;

    private FeedbackStatus status = FeedbackStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    private String adminNotes;
}