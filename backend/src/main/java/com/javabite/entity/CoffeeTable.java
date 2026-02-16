package com.javabite.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tables")
public class CoffeeTable {
    @Id
    private String id;

    @Indexed(unique = true)
    private String tableNumber;

    private Integer capacity; // 2, 4, 6, 8 persons

    private TableStatus status;

    private String location; // Window, Center, Corner, Outdoor
    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TableStatus {
        AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    }
}