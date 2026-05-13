package com.kronpark.backend.service;

import com.kronpark.backend.dto.PrivateSpotRequest;
import com.kronpark.backend.dto.PrivateSpotResponse;
import com.kronpark.backend.entity.PrivateSpot;
import com.kronpark.backend.entity.SpotStatus;
import com.kronpark.backend.entity.User;
import com.kronpark.backend.repository.PrivateSpotRepository;
import com.kronpark.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrivateSpotService {

    private final PrivateSpotRepository privateSpotRepository;
    private final UserRepository userRepository;

    @Transactional
    public PrivateSpotResponse createPrivateSpot(PrivateSpotRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PrivateSpot spot = PrivateSpot.builder()
                .ownerName(request.ownerName())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .availableFrom(request.availableFrom())
                .availableTo(request.availableTo())
                .price(request.price())
                .zone(request.zone())
                .status(SpotStatus.AVAILABLE)
                .user(user)
                .build();

        return PrivateSpotResponse.from(privateSpotRepository.save(spot));
    }

    @Transactional(readOnly = true)
    public List<PrivateSpotResponse> getAllAvailableSpots() {
        return privateSpotRepository.findAllByStatus(SpotStatus.AVAILABLE)
                .stream()
                .map(PrivateSpotResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PrivateSpotResponse> getFilteredSpots(String zone) {
        LocalTime now = LocalTime.now();

        List<PrivateSpot> spots;
        if (zone != null && !zone.trim().isEmpty()) {
            spots = privateSpotRepository.findAllByZoneIgnoreCase(zone.trim());
        } else {
            spots = privateSpotRepository.findAll();
        }

        return spots.stream()
                .map(spot -> {

                    String calculatedStatus = isCurrentlyAvailable(spot, now) ? "AVAILABLE" : "OCCUPIED";


                    return new PrivateSpotResponse(
                            spot.getId(),
                            spot.getOwnerName(),
                            spot.getLatitude(),
                            spot.getLongitude(),
                            spot.getAvailableFrom(),
                            spot.getAvailableTo(),
                            spot.getPrice(),
                            spot.getZone(),
                            calculatedStatus
                    );
                })
                .toList();
    }

    private boolean isCurrentlyAvailable(PrivateSpot spot, LocalTime now) {
        if (spot.getAvailableTo().isAfter(spot.getAvailableFrom())) {
            return !now.isBefore(spot.getAvailableFrom()) && !now.isAfter(spot.getAvailableTo());
        } else {

            return !now.isBefore(spot.getAvailableFrom()) || !now.isAfter(spot.getAvailableTo());
        }
    }


}