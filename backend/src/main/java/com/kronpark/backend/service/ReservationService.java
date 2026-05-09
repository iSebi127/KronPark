package com.kronpark.backend.service;

import com.kronpark.backend.dto.ReservationRequest;
import com.kronpark.backend.dto.ReservationResponse;
import com.kronpark.backend.entity.*;
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ParkingSpotRepository parkingSpotRepository;

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request, String userEmail) {

        if (request.startTime().isAfter(request.endTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }


        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ParkingSpot spot = parkingSpotRepository.findById(request.parkingSpotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found"));


        boolean isOverlapping = reservationRepository.existsOverlappingReservation(
                spot.getId(), request.startTime(), request.endTime());

        if (isOverlapping) {
            throw new IllegalStateException("The parking spot is already reserved for this interval");
        }


        Reservation reservation = Reservation.builder()
                .user(user)
                .parkingSpot(spot)
                .startTime(request.startTime())
                .endTime(request.endTime())
                .status(ReservationStatus.ACTIVE)
                .build();

        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return reservationRepository.findByUserId(user.getId())
                .stream()
                .map(ReservationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void autoExpireReservations() {
        LocalDateTime now = LocalDateTime.now();

        int updatedCount = reservationRepository.updateStatusForExpiredReservations(
                ReservationStatus.ACTIVE,
                ReservationStatus.COMPLETED,
                now
        );

        if (updatedCount > 0) {
            System.out.println("There are " + updatedCount + " reservations marked as expired.");
        }
    }

    @Transactional
    public ReservationResponse cancelReservation(Long reservationId, String userEmail) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (!reservation.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("You can only cancel your own reservations");
        }

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Only active reservations can be cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);

        return ReservationResponse.from(reservationRepository.save(reservation));
    }
    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void notifyUpcomingExpirations() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tenMinutesFromNow = now.plusMinutes(10);

        List<Reservation> toNotify = reservationRepository.findReservationsToNotify(now, tenMinutesFromNow);

        for (Reservation reservation : toNotify) {
            System.out.println(" To: " + reservation.getUser().getEmail() +
                    " Reservation for parking spot " + reservation.getParkingSpot().getSpotNumber() +
                    " expires in less than 10 minutes!");
            reservation.setNotified(true);
        }
    }
}