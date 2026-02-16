package com.javabite.repository;

import com.javabite.entity.Order;
import com.javabite.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    long countByStatus(Order.OrderStatus status);

    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findByBookingId(String bookingId);

    List<Order> findByStatus(Order.OrderStatus status);

    List<Order> findByStatusInOrderByCreatedAtDesc(List<Order.OrderStatus> statuses);

    // Alias method for convenience
    default List<Order> findByStatusIn(List<Order.OrderStatus> statuses) {
        return findByStatusInOrderByCreatedAtDesc(statuses);
    }

    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Order> findByUser_IdAndStatusOrderByCreatedAtDesc(String userId, Order.OrderStatus status);
}
