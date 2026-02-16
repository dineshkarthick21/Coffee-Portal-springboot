package com.javabite.dto;

import com.javabite.entity.Role;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String id;
    private String email;
    private String name;
    private String phone;
    private Role role;
    private LocalDateTime createdAt; // Add this field

}