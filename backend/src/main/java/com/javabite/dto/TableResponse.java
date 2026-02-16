package com.javabite.dto;

import com.javabite.entity.CoffeeTable;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TableResponse {
    private String id;
    private String tableNumber;
    private Integer capacity;
    private String location;
    private String description;
    private CoffeeTable.TableStatus status;
}