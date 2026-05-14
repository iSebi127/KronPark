package com.kronpark.backend.service;

import com.kronpark.backend.dto.PrivateSpotRequest;
import com.kronpark.backend.dto.PrivateSpotResponse;
import com.kronpark.backend.entity.PrivateSpot;
import com.kronpark.backend.entity.SpotStatus;
import com.kronpark.backend.entity.User;
import com.kronpark.backend.exception.DuplicateResourceException;
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.repository.PrivateSpotRepository;
import com.kronpark.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime; // Aceasta lipsea acum
import java.util.List;

// ... restul codului

@Service
@RequiredArgsConstructor
public class PrivateSpotService {

    private final PrivateSpotRepository privateSpotRepository;
    private final UserRepository userRepository;

    @Transactional
    public PrivateSpotResponse createPrivateSpot(PrivateSpotRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean alreadyExists = privateSpotRepository.existsByUserAndZone(user, request.zone());
    
    if (alreadyExists) {
        throw new DuplicateResourceException("Ai deja un loc de parcare înregistrat în zona " + request.zone());
    }

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
    public List<PrivateSpotResponse> getMySpots(String email) {
    return privateSpotRepository.findAllByUser_Email(email)
            .stream()
            .map(PrivateSpotResponse::from)
            .toList();
}

    @Transactional(readOnly = true)
    public List<PrivateSpotResponse> getFilteredSpots(String zone) {
    List<PrivateSpot> spots;
    
    // Verificăm dacă filtrăm după zonă sau luăm tot
    if (zone != null && !zone.isEmpty()) {
        spots = privateSpotRepository.findAllByZoneIgnoreCase(zone);
    } else {
        spots = privateSpotRepository.findAll();
    }

    return spots.stream()
            .map(spot -> {
                // IMPORTANT: Aici decidem ce status vede celălalt user
                // Dacă în DB statusul este AVAILABLE, atunci și User B trebuie să îl vadă AVAILABLE
                return PrivateSpotResponse.from(spot); 
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