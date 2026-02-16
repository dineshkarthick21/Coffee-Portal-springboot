package com.javabite.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "order_items")
public class OrderItem {

    @Id
    private String id;

    @DBRef
    @JsonIgnoreProperties({"orderItems", "user", "booking"})
    private Order order;

    @DBRef
    private MenuItem menuItem;

    private Integer quantity;

    private BigDecimal unitPrice;

    private String specialInstructions;
}
