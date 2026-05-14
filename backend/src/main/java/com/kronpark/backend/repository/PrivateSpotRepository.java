package com.kronpark.backend.repository;

import com.kronpark.backend.entity.PrivateSpot;
import com.kronpark.backend.entity.User; // <--- ADAUGĂ ACEASTĂ LINIE!
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateSpotRepository extends JpaRepository<PrivateSpot, Long> {
    
    // Acum Java va recunoaște clasa User aici:
    boolean existsByUserAndZone(User user, String zone);

    List<PrivateSpot> findAllByStatus(com.kronpark.backend.entity.SpotStatus status);
    List<PrivateSpot> findAllByZoneIgnoreCase(String zone);
    List<PrivateSpot> findAllByUser_Email(String email);
}