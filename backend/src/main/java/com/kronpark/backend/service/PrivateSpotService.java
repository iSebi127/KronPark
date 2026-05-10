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
}