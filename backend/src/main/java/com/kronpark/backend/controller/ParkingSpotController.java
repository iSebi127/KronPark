package com.kronpark.backend.controller;

import com.kronpark.backend.dto.ParkingSpotResponse;
import com.kronpark.backend.service.ParkingSpotService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parking-spots")
public class ParkingSpotController {

    private final ParkingSpotService parkingSpotService;

    public ParkingSpotController(ParkingSpotService parkingSpotService) {
        this.parkingSpotService = parkingSpotService;
    }

    @GetMapping
    public List<ParkingSpotResponse> getAllSpots() {
        return parkingSpotService.getAllSpots();
    }

    @org.springframework.web.bind.annotation.GetMapping("/{spotNumber}")
    public ParkingSpotResponse getSpotByNumber(@org.springframework.web.bind.annotation.PathVariable String spotNumber) {
        return parkingSpotService.getSpotByNumber(spotNumber);
    }

    @org.springframework.web.bind.annotation.PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<ParkingSpotResponse> createSpot(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.kronpark.backend.dto.CreateParkingSpotRequest request
    ) {
        return org.springframework.http.ResponseEntity
                .status(org.springframework.http.HttpStatus.CREATED)
                .body(parkingSpotService.createSpot(request));
    }
}