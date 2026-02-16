package com.javabite.dto;

import com.javabite.entity.MenuItem;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class MenuItemResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private MenuItem.Category category;
    private String imageUrl;
    private Integer preparationTime;
    private Boolean available;
}