package com.javabite.service;

import com.javabite.dto.OrderRequest;
import com.javabite.dto.OrderResponse;
import com.javabite.dto.OrderItemRequest;
import com.javabite.dto.OrderItemResponse;
import com.javabite.entity.*;
import com.javabite.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderItemRepository orderItemRepository;

    // ✅ Create new order from customer
    @Transactional
    public OrderResponse createCustomerOrder(OrderRequest orderRequest) {
        // Validate user
        User user = userRepository.findById(orderRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate total amount
        BigDecimal totalAmount = calculateTotalAmount(orderRequest.getOrderItems());

        // Create order
        Order order = Order.builder()
                .user(user)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .specialInstructions(orderRequest.getSpecialInstructions())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Create order items
        List<OrderItem> orderItems = orderRequest.getOrderItems().stream()
                .map(itemRequest -> {
                    MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                            .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemRequest.getMenuItemId()));

                    return OrderItem.builder()
                            .order(savedOrder)
                            .menuItem(menuItem)
                            .quantity(itemRequest.getQuantity())
                            .unitPrice(menuItem.getPrice())
                            .specialInstructions(itemRequest.getSpecialInstructions())
                            .build();
                })
                .collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);
        savedOrder.setOrderItems(orderItems);

        return mapToOrderResponse(savedOrder);
    }

    // ✅ Calculate total amount from order items
    private BigDecimal calculateTotalAmount(List<OrderItemRequest> orderItems) {
        return orderItems.stream()
                .map(item -> {
                    MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                            .orElseThrow(() -> new RuntimeException("Menu item not found: " + item.getMenuItemId()));
                    return menuItem.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ✅ Get all orders for admin
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // ✅ Get orders by user (customer order history)
    public List<OrderResponse> getOrdersByUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // ✅ Get order by ID
    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderResponse(order);
    }

    // ✅ Update order status
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus enumStatus;
        try {
            enumStatus = Order.OrderStatus.valueOf(newStatus.toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid order status: " + newStatus);
        }

        order.setStatus(enumStatus);
        Order updatedOrder = orderRepository.save(order);

        return mapToOrderResponse(updatedOrder);
    }

    // ✅ Cancel order
    @Transactional
    public OrderResponse cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Only allow cancelling pending orders
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Cannot cancel order that is already " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);

        return mapToOrderResponse(cancelledOrder);
    }

    // ✅ DELETE ORDER METHOD
    @Transactional
    public void deleteOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Delete order items first (due to foreign key constraint)
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        orderItemRepository.deleteAll(orderItems);

        // Then delete the order
        orderRepository.delete(order);
    }

    // ✅ Helper method to map Order to OrderResponse
    // In your OrderService, update the mapToOrderResponse method:
    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = orderItemRepository.findByOrderIdWithMenuItem(order.getId())
                .stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        // Create user response
        OrderResponse.UserResponse userResponse = null;
        if (order.getUser() != null) {
            userResponse = OrderResponse.UserResponse.builder()
                    .id(order.getUser().getId())
                    .name(order.getUser().getName())
                    .email(order.getUser().getEmail())
                    .phone(order.getUser().getPhone())
                    .build();
        }

        // Create table response
        OrderResponse.TableResponse tableResponse = null;
        if (order.getTable() != null) {
            tableResponse = OrderResponse.TableResponse.builder()
                    .id(order.getTable().getId())
                    .tableNumber(order.getTable().getTableNumber())
                    .capacity(order.getTable().getCapacity())
                    .status(order.getTable().getStatus().toString())
                    .build();
        }

        return OrderResponse.builder()
                .id(order.getId())
                .status(convertOrderStatus(order.getStatus())) // Convert entity status to DTO status
                .totalAmount(order.getTotalAmount())
                .specialInstructions(order.getSpecialInstructions())
                .createdAt(order.getCreatedAt())
                .bookingId(order.getBooking() != null ? order.getBooking().getId() : null)
                .orderItems(itemResponses)
                .user(userResponse)
                .table(tableResponse)
                .build();
    }

    // Helper method to convert entity OrderStatus to DTO OrderStatus
    private OrderResponse.OrderStatus convertOrderStatus(Order.OrderStatus entityStatus) {
        if (entityStatus == null) return null;
        return OrderResponse.OrderStatus.valueOf(entityStatus.name());
    }
    // Add to your OrderService class
    @Transactional
    public OrderResponse createOrderWithRazorpay(OrderRequest orderRequest) {
        // Create order first using your existing method
        OrderResponse orderResponse = createCustomerOrder(orderRequest);

        // The payment will be initialized when customer goes to payment page
        return orderResponse;
    }

    // Helper method to get order by ID
    public Order getOrderEntityById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    // ✅ Helper method to map OrderItem to OrderItemResponse
    private OrderItemResponse mapToOrderItemResponse(OrderItem orderItem) {
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .menuItemId(orderItem.getMenuItem().getId())
                .menuItemName(orderItem.getMenuItem().getName())
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .specialInstructions(orderItem.getSpecialInstructions())
                .build();
    }
}