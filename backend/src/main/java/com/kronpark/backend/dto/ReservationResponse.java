package com.kronpark.backend.dto;

import com.kronpark.backend.entity.Reservation;
import com.kronpark.backend.entity.ReservationStatus;
import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        Long spotId,
        String spotNumber,
        String userEmail,
        LocalDateTime startTime,
        LocalDateTime endTime,
        ReservationStatus status
) {
    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getParkingSpot().getId(),
                reservation.getParkingSpot().getSpotNumber(),
                reservation.getUser().getEmail(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getStatus()
        );
    }
}