package com.javabite.repository;

import com.javabite.entity.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends MongoRepository<OrderItem, String> {
    List<OrderItem> findByOrderId(String orderId);
    List<OrderItem> findByMenuItemId(String menuItemId);

    // Helper method with join fetch simulation
    default List<OrderItem> findByOrderIdWithMenuItem(String orderId) {
        return findByOrderId(orderId);
    }
}