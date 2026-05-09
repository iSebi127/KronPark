package com.kronpark.backend.service;

import com.kronpark.backend.dto.ParkingSpotResponse;
import com.kronpark.backend.entity.ParkingSpot;
<<<<<<< HEAD
import com.kronpark.backend.entity.SpotStatus;
=======
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.repository.ParkingSpotRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;

    public ParkingSpotService(ParkingSpotRepository parkingSpotRepository) {
        this.parkingSpotRepository = parkingSpotRepository;
    }

    public List<ParkingSpotResponse> getAllSpots() {
<<<<<<< HEAD
        // Citim statusul direct din baza de date.
        // createReservation() si cancelReservation() mentin campul spot.status corect.
        return parkingSpotRepository.findAll()
                .stream()
                .map(spot -> new ParkingSpotResponse(
                        spot.getId(),
                        spot.getSpotNumber(),
                        spot.getStatus()
                ))
=======
        return parkingSpotRepository.findAll()
                .stream()
                .map(ParkingSpotResponse::from)
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
                .collect(Collectors.toList());
    }

    public ParkingSpotResponse getSpotByNumber(String spotNumber) {
        ParkingSpot spot = parkingSpotRepository.findBySpotNumber(spotNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found: " + spotNumber));
        return ParkingSpotResponse.from(spot);
    }

    public ParkingSpotResponse createSpot(com.kronpark.backend.dto.CreateParkingSpotRequest request) {
        if (parkingSpotRepository.existsBySpotNumber(request.spotNumber())) {
            throw new com.kronpark.backend.exception.DuplicateResourceException("Parking spot already exists");
        }

<<<<<<< HEAD
        ParkingSpot spot = new ParkingSpot();
        spot.setSpotNumber(request.spotNumber());
        spot.setStatus(SpotStatus.AVAILABLE);

        ParkingSpot savedSpot = parkingSpotRepository.save(spot);

        return ParkingSpotResponse.from(savedSpot);
    }
}
=======
        com.kronpark.backend.entity.ParkingSpot spot = new com.kronpark.backend.entity.ParkingSpot();
        spot.setSpotNumber(request.spotNumber());
        spot.setStatus(com.kronpark.backend.entity.SpotStatus.AVAILABLE);

        com.kronpark.backend.entity.ParkingSpot savedSpot = parkingSpotRepository.save(spot);

        return ParkingSpotResponse.from(savedSpot);
    }
}
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
