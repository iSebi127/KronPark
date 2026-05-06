package com.kronpark.backend.repository;

import com.kronpark.backend.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    boolean existsBySpotNumber(String spotNumber);
}