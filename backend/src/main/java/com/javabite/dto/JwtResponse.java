package com.javabite.dto;

import com.javabite.entity.Role;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String id;
    private String refreshToken; // ✅ ADDED: Refresh token field

    private String email;
    private String name;
    private Role role;
}