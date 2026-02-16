package com.javabite.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "menu_items")
public class MenuItem {

    @Id
    private String id;

    private String name;

    private String description;

    private BigDecimal price;

    private Category category;

    private String imageUrl;

    @Builder.Default
    private Boolean available = true;

    @Builder.Default
    private Integer preparationTime = 5;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // --- Enum Definition ---
    public enum Category {
        ESPRESSO,
        CAPPUCCINO,
        LATTE,
        AMERICANO,
        MOCHA,
        COLD_BREW,
        MACCHIATO,
        AFFOGATO,
        IRISH_COFFEE,
        TURKISH_COFFEE,
        VIETNAMESE_COFFEE,
        FILTER_COFFEE,
        TEA,        // ✅ add this
        BLACK_TEA,  // optional
        GREEN_TEA   // optional
    }


    // ✅ Overloaded setter to handle both Enum and String input safely
    public void setCategory(Category category) {
        this.category = category;
    }

    public void setCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("Category cannot be null or empty");
        }
        try {
            this.category = Category.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid category: " + category +
                            ". Allowed values: " + java.util.Arrays.toString(Category.values())
            );
        }
    }
}
