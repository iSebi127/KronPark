package com.kronpark.backend.repository;

import com.kronpark.backend.entity.Reservation;
import com.kronpark.backend.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
            "WHERE r.parkingSpot.id = :spotId " +
            "AND r.status = 'ACTIVE' " +
            "AND (:start < r.endTime AND :end > r.startTime)")
    boolean existsOverlappingReservation(
            @Param("spotId") Long spotId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    List<Reservation> findByUserId(Long userId);

    @Modifying
    @Query("UPDATE Reservation r SET r.status = :completedStatus WHERE r.status = :activeStatus AND r.endTime <= :now")
    int updateStatusForExpiredReservations(
            @Param("activeStatus") ReservationStatus activeStatus,
            @Param("completedStatus") ReservationStatus completedStatus,
            @Param("now") LocalDateTime now
    );
}