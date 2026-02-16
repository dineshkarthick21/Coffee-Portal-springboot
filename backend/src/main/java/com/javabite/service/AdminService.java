package com.javabite.service;

import com.javabite.dto.CreateStaffRequest;
import com.javabite.entity.Role;
import com.javabite.entity.User;
import com.javabite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * Create new staff (waiter/chef) and send credentials via email
     */
    /**
     * Create new staff (waiter/chef) and send credentials via email
     */
    public User createStaff(CreateStaffRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Validate role (only CHEF or WAITER allowed)
        if (request.getRole() != Role.CHEF && request.getRole() != Role.WAITER) {
            throw new RuntimeException("Invalid role. Only CHEF or WAITER allowed.");
        }

        // Create staff user
        User staff = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .build();

        User savedStaff = userRepository.save(staff);

        // DEBUG: Print to console to verify which method is called
        System.out.println("🔄 SENDING STAFF CREDENTIALS EMAIL");
        System.out.println("📧 To: " + request.getEmail());
        System.out.println("👤 Name: " + request.getName());
        System.out.println("🎭 Role: " + request.getRole());
        System.out.println("🔑 Password: " + request.getPassword());

        // Send STAFF CREDENTIALS email (not welcome email)
        emailService.sendStaffCredentials(
                request.getEmail(),        // toEmail
                request.getName(),         // staffName
                request.getRole().name(),  // role
                request.getEmail(),        // loginEmail
                request.getPassword()      // password
        );

        System.out.println("✅ Staff credentials email sent to: " + request.getEmail());

        return savedStaff;
    }
    public List<User> getAllStaff() {
        return userRepository.findByRoleIn(List.of(Role.CHEF, Role.WAITER));
    }

    public Map<String, Long> getDashboardStats() {
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalChefs = userRepository.countByRole(Role.CHEF);
        long totalWaiters = userRepository.countByRole(Role.WAITER);
        long totalStaff = totalChefs + totalWaiters;

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalChefs", totalChefs);
        stats.put("totalWaiters", totalWaiters);
        stats.put("totalStaff", totalStaff);
        return stats;
    }
}