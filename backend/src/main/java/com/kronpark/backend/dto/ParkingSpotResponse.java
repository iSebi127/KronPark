package com.kronpark.backend.dto;

import com.kronpark.backend.entity.ParkingSpot;
import com.kronpark.backend.entity.SpotStatus;

public record ParkingSpotResponse(
        Long id,
        String spotNumber,
        SpotStatus status
) {
    public static ParkingSpotResponse from(ParkingSpot spot) {
        return new ParkingSpotResponse(
                spot.getId(),
                spot.getSpotNumber(),
                spot.getStatus()
        );
    }
}