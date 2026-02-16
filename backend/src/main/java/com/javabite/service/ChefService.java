package com.javabite.service;

import com.javabite.entity.Order;
import com.javabite.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChefService {

    private final OrderRepository orderRepository;

    // Get all orders that are either new or being prepared
    public List<Order> getPendingOrders() {
        return orderRepository.findByStatusIn(
                List.of(Order.OrderStatus.PENDING, Order.OrderStatus.PREPARING)
        );
    }

    // Update status of an order (PREPARING, READY, etc.)
    public Order updateOrderStatus(String orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
