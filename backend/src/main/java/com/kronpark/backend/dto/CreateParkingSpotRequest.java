package com.kronpark.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateParkingSpotRequest(
        @NotBlank(message = "Spot number is required")
        String spotNumber
) {
}