package com.kronpark.backend.dto;

import com.kronpark.backend.entity.Reservation;
import com.kronpark.backend.entity.ReservationStatus;
import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        Long spotId,
        String lotId,
        String spotNumber,
        String userEmail,
        LocalDateTime startTime,
        LocalDateTime endTime,
        ReservationStatus status
) {
    public static ReservationResponse from(Reservation reservation) {
        if (reservation == null) return null;

        Long spotId = null;
        String spotNumber = null;
        String lotId = null;

        if (reservation.getParkingSpot() != null) {
            spotId = reservation.getParkingSpot().getId();
            spotNumber = reservation.getParkingSpot().getSpotNumber();
            lotId = reservation.getParkingSpot().getLotId();
        }

        String userEmail = null;
        if (reservation.getUser() != null) {
            userEmail = reservation.getUser().getEmail();
        }

        return new ReservationResponse(
                reservation.getId(),
                spotId,
                lotId,
                spotNumber,
                userEmail,
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getStatus()
        );
    }
}