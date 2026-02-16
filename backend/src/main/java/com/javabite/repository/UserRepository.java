package com.javabite.repository;

import com.javabite.entity.User;
import com.javabite.entity.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    List<User> findByRoleIn(List<Role> roles);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    List<User> findByNameContainingIgnoreCase(String name);
    List<User> findByRoleAndCreatedAtBetween(Role role, LocalDateTime startDate, LocalDateTime endDate);
    long countByRoleAndCreatedAtBetween(Role role, LocalDateTime start, LocalDateTime end);
}