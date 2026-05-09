package com.kronpark.backend.repository;

import com.kronpark.backend.entity.ParkingSpot;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD

import java.util.Optional;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {

    Optional<ParkingSpot> findBySpotNumber(String spotNumber);

    boolean existsBySpotNumber(String spotNumber);
}
=======
import java.util.Optional;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    boolean existsBySpotNumber(String spotNumber);
    Optional<ParkingSpot> findBySpotNumber(String spotNumber);
}
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
