package com.kronpark.backend.dto;

import com.kronpark.backend.entity.User;
import com.kronpark.backend.entity.UserRole;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        UserRole role,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
