package com.javabite.controller;

import com.javabite.dto.OrderResponse;
import com.javabite.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final OrderService orderService;

    // ✅ Get all orders for waiter (focus on READY and SERVED orders)
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getWaiterOrders() {
        try {
            List<OrderResponse> orders = orderService.getAllOrders();
            // Filter orders for waiter - use OrderResponse.OrderStatus
            List<OrderResponse> waiterOrders = orders.stream()
                    .filter(order ->
                            order.getStatus() == OrderResponse.OrderStatus.READY ||
                                    order.getStatus() == OrderResponse.OrderStatus.SERVED
                    )
                    .toList();
            return ResponseEntity.ok(waiterOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ Update order status (for waiter workflow)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @RequestParam String status) {
        try {
            // Validate that waiter can only set specific statuses
            String upperStatus = status.toUpperCase();
            if (!List.of("SERVED", "COMPLETED").contains(upperStatus)) {
                return ResponseEntity.badRequest().body("Waiter can only set status to SERVED or COMPLETED");
            }

            OrderResponse updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating order: " + e.getMessage());
        }
    }

    // ✅ Get orders by table number
    @GetMapping("/orders/table/{tableNumber}")
    public ResponseEntity<List<OrderResponse>> getOrdersByTable(@PathVariable String tableNumber) {
        try {
            List<OrderResponse> orders = orderService.getAllOrders();
            // Filter orders by table number
            List<OrderResponse> tableOrders = orders.stream()
                    .filter(order -> order.getTable() != null &&
                            order.getTable().getTableNumber().equals(tableNumber))
                    .toList();
            return ResponseEntity.ok(tableOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}