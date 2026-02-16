package com.javabite.controller;

import com.javabite.dto.CreatePaymentRequest;
import com.javabite.dto.PaymentResponse;
import com.javabite.dto.PaymentVerificationRequest;
import com.javabite.entity.Payment;
import com.javabite.entity.User;
import com.javabite.service.JwtService;
import com.javabite.service.PaymentService;
import com.javabite.service.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping("/create-razorpay-order")
    public ResponseEntity<PaymentResponse> createRazorpayOrder(
            @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest) {

        log.info("=== CREATE RAZORPAY ORDER ===");
        log.info("Request: {}", request);

        // 🔥 FIX: Extract customer from JWT token manually
        User customer = extractCustomerFromToken(httpRequest);

        if (customer == null) {
            log.error("❌ Customer is NULL - Authentication failed!");
            PaymentResponse response = new PaymentResponse();
            response.setSuccess(false);
            response.setMessage("Authentication failed. Please log in again.");
            return ResponseEntity.status(401).body(response);
        }

        log.info("✅ Customer authenticated: {} (ID: {})", customer.getEmail(), customer.getId());

        PaymentResponse response = paymentService.createRazorpayOrder(request, customer);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-razorpay")
    public ResponseEntity<PaymentResponse> verifyRazorpayPayment(
            @RequestBody PaymentVerificationRequest request) {

        log.info("=== VERIFY RAZORPAY PAYMENT ===");
        log.info("Verification request: {}", request);

        PaymentResponse response = paymentService.verifyPayment(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable String orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(
            @RequestParam String orderId,
            @RequestParam BigDecimal amount,
            @RequestParam Payment.PaymentMethod method) {

        Payment payment = paymentService.processPayment(orderId, amount, method);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Payment API is running");
    }

    @GetMapping("/debug-auth")
    public ResponseEntity<?> debugAuthentication(HttpServletRequest request) {
        log.info("=== DEBUG AUTHENTICATION ===");

        // Manual extraction
        User manualUser = extractCustomerFromToken(request);

        // Spring Security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("manualUser", manualUser != null ?
                manualUser.getEmail() + " (ID: " + manualUser.getId() + ")" : "null");
        debugInfo.put("securityContextAuth", auth != null ? auth.toString() : "null");
        debugInfo.put("authenticated", auth != null && auth.isAuthenticated());

        if (auth != null) {
            debugInfo.put("principalType", auth.getPrincipal().getClass().getSimpleName());
            debugInfo.put("authorities", auth.getAuthorities().toString());
        }

        // Token details
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                debugInfo.put("tokenEmail", jwtService.extractUsername(token));
                debugInfo.put("tokenUserId", jwtService.extractUserId(token));
                debugInfo.put("tokenRole", jwtService.extractRole(token));
                debugInfo.put("tokenValid", !jwtService.isTokenExpired(token));
            } catch (Exception e) {
                debugInfo.put("tokenError", e.getMessage());
            }
        }

        return ResponseEntity.ok(debugInfo);
    }

    @GetMapping("/debug-token")
    public ResponseEntity<?> debugToken(HttpServletRequest request) {
        log.info("=== TOKEN DEBUG ===");

        String authHeader = request.getHeader("Authorization");
        Map<String, Object> debugInfo = new HashMap<>();

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String email = jwtService.extractUsername(token);
                String userId = jwtService.extractUserId(token);
                String role = jwtService.extractRole(token);
                String name = jwtService.extractClaim(token, claims -> claims.get("name", String.class));

                debugInfo.put("email", email);
                debugInfo.put("userId", userId);
                debugInfo.put("role", role);
                debugInfo.put("name", name);
                debugInfo.put("tokenValid", !jwtService.isTokenExpired(token));

                // Try to load user from database
                User user = null;
                if (userId != null) {
                    user = userDetailsService.loadFullUserById(userId);
                } else if (email != null) {
                    user = userDetailsService.loadFullUserByEmail(email);
                }
                debugInfo.put("userInDatabase", user != null);
                debugInfo.put("userDetails", user != null ? user.getEmail() + " (ID: " + user.getId() + ")" : "null");

            } catch (Exception e) {
                debugInfo.put("error", "Invalid token: " + e.getMessage());
            }
        } else {
            debugInfo.put("error", "No Bearer token provided");
        }

        return ResponseEntity.ok(debugInfo);
    }

    // 🔥 FIX: Manual JWT extraction with Long userId
    private User extractCustomerFromToken(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String userEmail = jwtService.extractUsername(token);
                String userId = jwtService.extractUserId(token);

                log.info("🔧 Manual extraction - Email: {}, User ID: {}", userEmail, userId);

                // Try by ID first (more reliable)
                if (userId != null) {
                    try {
                        User user = userDetailsService.loadFullUserById(userId);
                        log.info("✅ User found by ID: {} - {}", userId, user.getEmail());
                        return user;
                    } catch (Exception e) {
                        log.warn("⚠️ User not found by ID {}, trying email...", userId);
                    }
                }

                // Fallback to email
                if (userEmail != null) {
                    User user = userDetailsService.loadFullUserByEmail(userEmail);
                    log.info("✅ User found by email: {}", userEmail);
                    return user;
                }
            } else {
                log.warn("⚠️ No Bearer token found in request");
            }
        } catch (Exception e) {
            log.error("❌ Error in manual JWT extraction: {}", e.getMessage());
        }

        return null;
    }
}