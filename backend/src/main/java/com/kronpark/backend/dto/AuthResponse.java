package com.kronpark.backend.dto;

public record AuthResponse(
        String message,
        UserResponse user
) {
}
