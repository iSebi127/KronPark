package com.kronpark.backend.dto;

import com.kronpark.backend.entity.PrivateSpot;
import java.math.BigDecimal;
import java.time.LocalTime;

public record PrivateSpotResponse(
        Long id,
        String ownerName,
        Double latitude,
        Double longitude,
        LocalTime availableFrom,
        LocalTime availableTo,
        BigDecimal price,
        String zone,
        String status
) {
    public static PrivateSpotResponse from(PrivateSpot spot) {
        return new PrivateSpotResponse(
                spot.getId(),
                spot.getOwnerName(),
                spot.getLatitude(),
                spot.getLongitude(),
                spot.getAvailableFrom(),
                spot.getAvailableTo(),
                spot.getPrice(),
                spot.getZone(),
                spot.getStatus().name()
        );
    }
}