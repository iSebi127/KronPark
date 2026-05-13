package com.kronpark.backend.controller;

import com.kronpark.backend.dto.PrivateSpotRequest;
import com.kronpark.backend.dto.PrivateSpotResponse;
import com.kronpark.backend.service.PrivateSpotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/private-spots")
@RequiredArgsConstructor
public class PrivateSpotController {

    private final PrivateSpotService privateSpotService;

    @PostMapping
    public ResponseEntity<PrivateSpotResponse> createSpot(@RequestBody PrivateSpotRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(privateSpotService.createPrivateSpot(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<PrivateSpotResponse>> getAvailableSpots(@RequestParam(required = false) String zone) {
        return ResponseEntity.ok(privateSpotService.getFilteredSpots(zone));
    }
}