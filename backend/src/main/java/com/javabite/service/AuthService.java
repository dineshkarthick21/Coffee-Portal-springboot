package com.javabite.service;

import com.javabite.dto.JwtResponse;
import com.javabite.dto.LoginRequest;
import com.javabite.dto.RegisterRequest;
import com.javabite.entity.Role;
import com.javabite.entity.User;
import com.javabite.exception.UserAlreadyExistsException;
import com.javabite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService;

    /**
     * Register a new customer user
     */
    public User registerCustomer(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .build();

        return userRepository.save(user);
    }

    /**
     * Login user and generate JWT token with role claims
     */
    public JwtResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Load full user entity (with role)
            User user = userDetailsService.loadFullUserByEmail(request.getEmail());

            // ✅ Add custom claims manually (fix for missing role)
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole().name());
            claims.put("userId", user.getId());
            claims.put("name", user.getName());
            claims.put("email", user.getEmail());

            // ✅ Generate JWT with these claims
            String jwt = jwtService.generateTokenForUser(claims, user);

            // ✅ ADDED: Generate refresh token
            String refreshToken = jwtService.generateRefreshToken(user);

            // Return response with both tokens
            return JwtResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken) // ✅ ADDED: Include refresh token
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .build();

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        } catch (Exception e) {
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    /**
     * ✅ ADDED: Refresh token method
     * Generate new access token using refresh token
     */
    public JwtResponse refreshToken(String refreshToken) {
        try {
            // Validate refresh token
            if (!jwtService.validateRefreshToken(refreshToken)) {
                throw new RuntimeException("Invalid or expired refresh token");
            }

            // Extract username from refresh token
            String username = jwtService.extractUsernameFromRefreshToken(refreshToken);

            // Load user from database
            User user = userDetailsService.loadFullUserByEmail(username);

            // ✅ Add custom claims for new token
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole().name());
            claims.put("userId", user.getId());
            claims.put("name", user.getName());
            claims.put("email", user.getEmail());

            // Generate new access token
            String newToken = jwtService.generateTokenForUser(claims, user);

            // Generate new refresh token (optional: you can keep the same refresh token)
            String newRefreshToken = jwtService.generateRefreshToken(user);

            // Return new tokens
            return JwtResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    /**
     * Check if email already exists
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Forgot password – generate reset token and send mail
     */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && user.getRole() == Role.CUSTOMER) {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(email, resetToken);
        }
    }

    /**
     * Reset password using valid token
     */
    public boolean resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token).orElse(null);

        if (user != null &&
                user.getTokenExpiry() != null &&
                user.getTokenExpiry().isAfter(LocalDateTime.now())) {

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetToken(null);
            user.setTokenExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    /**
     * Validate password reset token
     */
    public boolean validateResetToken(String token) {
        User user = userRepository.findByResetToken(token).orElse(null);

        return user != null &&
                user.getTokenExpiry() != null &&
                user.getTokenExpiry().isAfter(LocalDateTime.now());
    }

    /**
     * ✅ ADDED: Get current authenticated user
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("No authenticated user");
    }

    /**
     * ✅ ADDED: Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            return jwtService.isTokenValid(token, userDetails);
        } catch (Exception e) {
            return false;
        }
    }
}