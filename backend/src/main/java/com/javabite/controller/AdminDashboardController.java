package com.javabite.controller;

import com.javabite.entity.Order;
import com.javabite.entity.Role;
import com.javabite.repository.OrderRepository;
import com.javabite.repository.UserRepository;
import com.javabite.repository.CoffeeTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "app.frontend.url")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CoffeeTableRepository tableRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {

        Map<String, Object> stats = new HashMap<>();

        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalStaff = userRepository.countByRole(Role.WAITER) + userRepository.countByRole(Role.CHEF);

        long totalOrders = orderRepository.count();
        long pending = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long confirmed = orderRepository.countByStatus(Order.OrderStatus.CONFIRMED);
        long preparing = orderRepository.countByStatus(Order.OrderStatus.PREPARING);
        long served = orderRepository.countByStatus(Order.OrderStatus.SERVED);
        long completed = orderRepository.countByStatus(Order.OrderStatus.COMPLETED);


        long totalTables = tableRepository.count();

        stats.put("customers", totalCustomers);
        stats.put("staff", totalStaff);
        stats.put("orders", totalOrders);
        stats.put("pendingOrders", pending);
        stats.put("confirmedOrders", confirmed);
        stats.put("preparingOrders", preparing);
        stats.put("servedOrders", served);
        stats.put("completedOrders", completed);
        stats.put("tables", totalTables);

        return ResponseEntity.ok(stats);
    }
}
