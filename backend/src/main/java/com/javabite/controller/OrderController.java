package com.javabite.controller;

import com.javabite.dto.OrderRequest;
import com.javabite.dto.OrderItemRequest;
import com.javabite.entity.*;
import com.javabite.repository.*;
import com.javabite.service.EmailService;
import com.javabite.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final EmailService emailService;
    private final PdfService pdfService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            // Validate user
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Calculate total amount from order items
            BigDecimal totalAmount = calculateTotalAmount(request.getOrderItems());

            // Create order
            Order order = Order.builder()
                    .user(user)
                    .status(Order.OrderStatus.PENDING)
                    .totalAmount(totalAmount)
                    .specialInstructions(request.getSpecialInstructions())
                    .build();

            Order savedOrder = orderRepository.save(order);

            // Create order items
            List<OrderItem> orderItems = new ArrayList<>();
            for (OrderItemRequest itemReq : request.getOrderItems()) {
                MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                        .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemReq.getMenuItemId()));

                OrderItem orderItem = OrderItem.builder()
                        .order(savedOrder)
                        .menuItem(menuItem)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(menuItem.getPrice())
                        .specialInstructions(itemReq.getSpecialInstructions())
                        .build();

                orderItems.add(orderItem);
            }

            orderItemRepository.saveAll(orderItems);
            savedOrder.setOrderItems(orderItems);

            return ResponseEntity.ok(savedOrder);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        }
    }

    private BigDecimal calculateTotalAmount(List<OrderItemRequest> orderItems) {
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest item : orderItems) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + item.getMenuItemId()));

            // CORRECTED: Use BigDecimal.valueOf for quantity and multiply directly
            BigDecimal itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);
        }
        return total;
    }

    // Additional endpoints for order management
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/{orderId}/receipt")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable String orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            byte[] pdfBytes = pdfService.generateReceiptPdf(order);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "JavaBite-Receipt-Order-" + orderId + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 🔥 NEW: Download Invoice as PDF
    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable String orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            byte[] pdfBytes = pdfService.generateInvoicePdf(order);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "JavaBite-Invoice-Order-" + orderId + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 🔥 NEW: Email Receipt to Customer
    @PostMapping("/{orderId}/email-receipt")
    public ResponseEntity<?> emailReceipt(@PathVariable String orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Generate PDF receipt
            byte[] pdfBytes = pdfService.generateReceiptPdf(order);

            // Send email with receipt attachment
            boolean emailSent = emailService.sendOrderReceipt(
                    order.getUser().getEmail(),
                    order.getUser().getName(),
                    order,
                    pdfBytes,
                    "JavaBite-Receipt-Order-" + orderId + ".pdf"
            );

            if (emailSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Receipt sent to email successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Failed to send email");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error sending email: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 🔥 NEW: Email Invoice to Customer
    @PostMapping("/{orderId}/email-invoice")
    public ResponseEntity<?> emailInvoice(@PathVariable String orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Generate PDF invoice
            byte[] pdfBytes = pdfService.generateInvoicePdf(order);

            // Send email with invoice attachment
            boolean emailSent = emailService.sendOrderInvoice(
                    order.getUser().getEmail(),
                    order.getUser().getName(),
                    order,
                    pdfBytes,
                    "JavaBite-Invoice-Order-" + orderId + ".pdf"
            );

            if (emailSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Invoice sent to email successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Failed to send email");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error sending email: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Order not found: " + e.getMessage());
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @RequestParam String status) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Order.OrderStatus orderStatus;
            try {
                orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status: " + status);
            }

            order.setStatus(orderStatus);
            Order updatedOrder = orderRepository.save(order);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating order: " + e.getMessage());
        }
    }
}