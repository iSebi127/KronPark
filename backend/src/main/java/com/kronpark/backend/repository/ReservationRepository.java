package com.kronpark.backend.repository;

import com.kronpark.backend.entity.ParkingSpot;
import com.kronpark.backend.entity.Reservation;
import com.kronpark.backend.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
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

    List<Reservation> findByStatusAndEndTimeBefore(ReservationStatus status, LocalDateTime time);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'ACTIVE' AND r.notified = false AND r.endTime BETWEEN :now AND :targetTime")
    List<Reservation> findReservationsToNotify(
            @Param("now") LocalDateTime now,
            @Param("targetTime") LocalDateTime targetTime
    );

    @Query("SELECT DISTINCT r.parkingSpot FROM Reservation r WHERE r.status = 'ACTIVE' AND r.endTime > :now")
    List<ParkingSpot> findSpotsWithActiveReservations(@Param("now") LocalDateTime now);
}
