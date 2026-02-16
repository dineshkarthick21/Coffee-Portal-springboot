package com.javabite.controller;

import com.javabite.dto.OrderResponse;
import com.javabite.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chef")
@RequiredArgsConstructor
public class ChefController {

    private final OrderService orderService;

    // ✅ Get all orders for chef (only PENDING, PREPARING, READY orders)
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getChefOrders() {
        try {
            List<OrderResponse> orders = orderService.getAllOrders();
            // Filter orders for chef - use OrderResponse.OrderStatus
            List<OrderResponse> chefOrders = orders.stream()
                    .filter(order ->
                            order.getStatus() == OrderResponse.OrderStatus.PENDING ||
                                    order.getStatus() == OrderResponse.OrderStatus.PREPARING ||
                                    order.getStatus() == OrderResponse.OrderStatus.READY
                    )
                    .toList();
            return ResponseEntity.ok(chefOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ Update order status (for chef workflow)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @RequestParam String status) {
        try {
            // Validate that chef can only set specific statuses
            String upperStatus = status.toUpperCase();
            if (!List.of("PREPARING", "READY", "COMPLETED").contains(upperStatus)) {
                return ResponseEntity.badRequest().body("Chef can only set status to PREPARING, READY, or COMPLETED");
            }

            OrderResponse updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating order: " + e.getMessage());
        }
    }
}