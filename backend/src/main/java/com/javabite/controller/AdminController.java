package com.javabite.controller;

import com.javabite.dto.CreateStaffRequest;
import com.javabite.dto.UpdateStaffRequest;
import com.javabite.dto.UserResponse;
import com.javabite.entity.Role;
import com.javabite.entity.User;
import com.javabite.repository.UserRepository;
import com.javabite.service.AdminService;
import com.javabite.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Admin Controller", description = "Handles admin operations including staff management")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final AdminService adminService;

    // Create new staff account (Chef or Waiter) WITH EMAIL NOTIFICATION
    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        try {
            // Use AdminService to create staff (this will handle all logic including email)
            User savedStaff = adminService.createStaff(request);

            // Build response
            UserResponse response = UserResponse.builder()
                    .id(savedStaff.getId())
                    .email(savedStaff.getEmail())
                    .name(savedStaff.getName())
                    .phone(savedStaff.getPhone())
                    .role(savedStaff.getRole())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating staff account: " + e.getMessage());
        }
    }

    // Get all staff members (CHEF and WAITER)
    @GetMapping("/staff")
    public ResponseEntity<List<UserResponse>> getAllStaff() {
        List<User> staffUsers = adminService.getAllStaff();

        List<UserResponse> staffList = staffUsers.stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(staffList);
    }

    // Get staff by role
    @GetMapping("/staff/role/{role}")
    public ResponseEntity<List<UserResponse>> getStaffByRole(@PathVariable Role role) {
        List<User> staffUsers = userRepository.findByRole(role);

        List<UserResponse> staffList = staffUsers.stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(staffList);
    }

    // Update staff account
    @PutMapping("/staff/{id}")
    public ResponseEntity<?> updateStaff(
            @PathVariable String id,
            @Valid @RequestBody UpdateStaffRequest request) {
        try {
            User staff = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Staff not found"));

            // Check if trying to update admin (shouldn't be allowed)
            if (staff.getRole() == Role.ADMIN) {
                return ResponseEntity.badRequest().body("Cannot update admin accounts");
            }

            // Check if email is being changed and if new email already exists
            if (!staff.getEmail().equals(request.getEmail()) &&
                    authService.emailExists(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email already registered: " + request.getEmail());
            }

            // Update staff details
            staff.setName(request.getName());
            staff.setEmail(request.getEmail());
            staff.setPhone(request.getPhone());

            // Only update password if provided
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                staff.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            // Update role if provided and valid
            if (request.getRole() != null &&
                    (request.getRole() == Role.CHEF || request.getRole() == Role.WAITER)) {
                staff.setRole(request.getRole());
            }

            User updatedStaff = userRepository.save(staff);

            UserResponse response = UserResponse.builder()
                    .id(updatedStaff.getId())
                    .email(updatedStaff.getEmail())
                    .name(updatedStaff.getName())
                    .phone(updatedStaff.getPhone())
                    .role(updatedStaff.getRole())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating staff account: " + e.getMessage());
        }
    }

    // Get staff by ID
    @GetMapping("/staff/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable String id) {
        try {
            User staff = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Staff not found"));

            // Only allow access to CHEF and WAITER roles
            if (staff.getRole() != Role.CHEF && staff.getRole() != Role.WAITER) {
                return ResponseEntity.badRequest().body("Invalid staff member");
            }

            UserResponse response = UserResponse.builder()
                    .id(staff.getId())
                    .email(staff.getEmail())
                    .name(staff.getName())
                    .phone(staff.getPhone())
                    .role(staff.getRole())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching staff details: " + e.getMessage());
        }
    }

    // Delete staff account
    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable String id) {
        try {
            User staff = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Staff not found"));

            // Prevent deleting admin accounts
            if (staff.getRole() == Role.ADMIN) {
                return ResponseEntity.badRequest().body("Cannot delete admin accounts");
            }

            userRepository.delete(staff);
            return ResponseEntity.ok("Staff account deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting staff: " + e.getMessage());
        }
    }
}