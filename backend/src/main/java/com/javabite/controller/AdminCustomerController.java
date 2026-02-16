package com.javabite.controller;

import com.javabite.entity.Role;
import com.javabite.entity.User;
import com.javabite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "app.frontend.url")
public class AdminCustomerController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllCustomers() {
        // only CUSTOMERS, not admin/chef/waiter
        List<User> customers = userRepository.findByRole(Role.CUSTOMER);

        return ResponseEntity.ok(customers);
    }
}
