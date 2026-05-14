package com.kronpark.backend.service;

import com.kronpark.backend.dto.ParkingSpotResponse;
import com.kronpark.backend.entity.ParkingSpot;
import com.kronpark.backend.entity.SpotStatus;
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

    public List<ParkingSpotResponse> getAllSpots(String lotId) {
        List<ParkingSpot> spots = (lotId != null && !lotId.isEmpty())
                ? parkingSpotRepository.findByLotId(lotId)
                : parkingSpotRepository.findAll();

        return spots.stream()
                .map(spot -> new ParkingSpotResponse(
                        spot.getId(),
                        spot.getSpotNumber(),
                        spot.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public ParkingSpotResponse getSpotByLotAndNumber(String lotId, String spotNumber) {
        ParkingSpot spot = parkingSpotRepository.findByLotIdAndSpotNumber(lotId, spotNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found: " + spotNumber + " in lot: " + lotId));
        return ParkingSpotResponse.from(spot);
    }

    public ParkingSpotResponse createSpot(com.kronpark.backend.dto.CreateParkingSpotRequest request) {
        if (parkingSpotRepository.existsByLotIdAndSpotNumber(request.lotId(), request.spotNumber())) {
            throw new com.kronpark.backend.exception.DuplicateResourceException("Parking spot already exists in this lot");
        }

        ParkingSpot spot = new ParkingSpot();
        spot.setLotId(request.lotId());
        spot.setSpotNumber(request.spotNumber());
        spot.setStatus(SpotStatus.AVAILABLE);

        ParkingSpot savedSpot = parkingSpotRepository.save(spot);

        return ParkingSpotResponse.from(savedSpot);
    }
}