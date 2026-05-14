package com.kronpark.backend.repository;

import com.kronpark.backend.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {

    Optional<ParkingSpot> findByLotIdAndSpotNumber(String lotId, String spotNumber);

    boolean existsByLotIdAndSpotNumber(String lotId, String spotNumber);

    List<ParkingSpot> findByLotId(String lotId);
}