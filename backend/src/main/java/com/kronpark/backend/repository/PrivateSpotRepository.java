package com.kronpark.backend.repository;

import com.kronpark.backend.entity.PrivateSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateSpotRepository extends JpaRepository<PrivateSpot, Long> {
    List<PrivateSpot> findAllByStatus(com.kronpark.backend.entity.SpotStatus status);
}