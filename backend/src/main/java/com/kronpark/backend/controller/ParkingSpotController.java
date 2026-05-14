package com.kronpark.backend.controller;

import com.kronpark.backend.dto.CreateParkingSpotRequest;
import com.kronpark.backend.dto.ParkingSpotResponse;
import com.kronpark.backend.service.ParkingSpotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-spots")
public class ParkingSpotController {

    private final ParkingSpotService parkingSpotService;

    public ParkingSpotController(ParkingSpotService parkingSpotService) {
        this.parkingSpotService = parkingSpotService;
    }

    @GetMapping
    public List<ParkingSpotResponse> getAllSpots(@RequestParam(required = false) String lotId) {
        return parkingSpotService.getAllSpots(lotId);
    }

    @GetMapping("/{spotNumber}")
    public ParkingSpotResponse getSpotByNumber(
            @PathVariable String spotNumber,
            @RequestParam String lotId) {
        return parkingSpotService.getSpotByLotAndNumber(lotId, spotNumber);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ParkingSpotResponse createSpot(@RequestBody @Valid CreateParkingSpotRequest request) {
        return parkingSpotService.createSpot(request);
    }
}