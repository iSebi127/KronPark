package com.kronpark.backend.service;

import com.kronpark.backend.dto.ReservationRequest;
import com.kronpark.backend.dto.ReservationResponse;
import com.kronpark.backend.entity.*;
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public List<ReservationResponse> getMyReservations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return reservationRepository.findByUserId(user.getId())
                .stream()
                .map(ReservationResponse::from)
                .collect(Collectors.toList());
    }
}