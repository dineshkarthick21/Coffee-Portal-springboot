package com.javabite.service;

import com.javabite.entity.User;
import com.javabite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("🔍 Loading user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("❌ User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        log.info("✅ User found: {} with role: {} and ID: {}", user.getEmail(), user.getRole(), user.getId());

        // Handle null password
        String password = user.getPassword() != null ? user.getPassword() : "";
        if (password.isEmpty()) {
            log.warn("⚠️ User password is empty for email: {}", email);
        }

        // Create Spring Security UserDetails
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(password)
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();

        log.info("🏗️ UserDetails created with authorities: {}", userDetails.getAuthorities());
        return userDetails;
    }

    /**
     * Helper method to get full User entity by email
     */
    public User loadFullUserByEmail(String email) throws UsernameNotFoundException {
        log.info("🔍 Loading full user entity by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("❌ User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        log.info("✅ Full user entity loaded: {} (ID: {})", user.getEmail(), user.getId());
        return user;
    }

    /**
     * Helper method to get full User entity by ID (String)
     */
    public User loadFullUserById(String id) throws UsernameNotFoundException {
        log.info("🔍 Loading full user entity by ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("❌ User not found with ID: {}", id);
                    return new UsernameNotFoundException("User not found with ID: " + id);
                });

        log.info("✅ Full user entity loaded: {} (ID: {})", user.getEmail(), user.getId());
        return user;
    }
}