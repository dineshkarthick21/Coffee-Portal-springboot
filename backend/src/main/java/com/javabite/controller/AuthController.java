package com.javabite.controller;

import com.javabite.dto.*;
import com.javabite.entity.Role;
import com.javabite.entity.User;
import com.javabite.repository.UserRepository;
import com.javabite.service.AuthService;
import com.javabite.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final EmailService emailService; // Add EmailService dependency

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.registerCustomer(request);

            // Send welcome email after successful registration
            try {
                emailService.sendWelcomeEmail(user.getEmail(), user.getName());
            } catch (Exception emailException) {
                // Log email error but don't fail the registration
                System.err.println("Failed to send welcome email: " + emailException.getMessage());
                // You can log this to a proper logging system
            }

            UserResponse response = UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .phone(user.getPhone())
                    .role(user.getRole())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            JwtResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        boolean exists = authService.emailExists(email);
        return ResponseEntity.ok().body(exists);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok("If the email exists, a reset link has been sent");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing request");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            boolean success = authService.resetPassword(request.getToken(), request.getNewPassword());
            return success
                    ? ResponseEntity.ok("Password reset successfully")
                    : ResponseEntity.badRequest().body("Invalid or expired reset token");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error resetting password");
        }
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            boolean valid = authService.validateResetToken(token);
            return valid
                    ? ResponseEntity.ok("Token is valid")
                    : ResponseEntity.badRequest().body("Invalid or expired token");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error validating token");
        }
    }
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            JwtResponse response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token refresh failed: " + e.getMessage());
        }
    }
    @PostMapping("/create-staff")
    public ResponseEntity<?> createStaffAccount(@RequestBody Map<String, String> request) {
        try {
            PasswordEncoder encoder = new BCryptPasswordEncoder();

            if (userRepository.existsByEmail(request.get("email"))) {
                return ResponseEntity.badRequest().body("Email already registered");
            }

            User staff = User.builder()
                    .email(request.get("email"))
                    .password(encoder.encode(request.get("password")))
                    .name(request.get("name"))
                    .role(Role.valueOf(request.get("role")))
                    .build();

            User savedStaff = userRepository.save(staff);

            // ✅ FIX: Send STAFF CREDENTIALS email instead of welcome email
            try {
                emailService.sendStaffCredentials(
                        savedStaff.getEmail(),           // toEmail
                        savedStaff.getName(),            // staffName
                        savedStaff.getRole().name(),     // role
                        savedStaff.getEmail(),           // loginEmail
                        request.get("password")          // password
                );
                System.out.println("✅ Staff credentials email sent to: " + savedStaff.getEmail());
            } catch (Exception emailException) {
                System.err.println("❌ Failed to send staff credentials email: " + emailException.getMessage());
            }

            return ResponseEntity.ok("Staff account created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    // Optional: Add an endpoint to test email service
    @PostMapping("/test-email")
    public ResponseEntity<?> testEmailService(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");

            if (email == null || name == null) {
                return ResponseEntity.badRequest().body("Email and name are required");
            }

            emailService.sendWelcomeEmail(email, name);
            return ResponseEntity.ok("Test email sent successfully to: " + email);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
        }
    }
}