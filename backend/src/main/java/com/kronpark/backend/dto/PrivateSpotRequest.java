package com.kronpark.backend.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

public record PrivateSpotRequest(
        String ownerName,
        Double latitude,
        Double longitude,
        LocalTime availableFrom,
        LocalTime availableTo,
        BigDecimal price,
        String zone
) {}