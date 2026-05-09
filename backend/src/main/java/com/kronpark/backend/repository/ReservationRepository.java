package com.kronpark.backend.repository;

<<<<<<< HEAD
import com.kronpark.backend.entity.ParkingSpot;
import com.kronpark.backend.entity.Reservation;
import com.kronpark.backend.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

=======
import com.kronpark.backend.entity.Reservation;
import com.kronpark.backend.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
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

<<<<<<< HEAD
    List<Reservation> findByStatusAndEndTimeBefore(ReservationStatus status, LocalDateTime time);

=======
    @Modifying
    @Query("UPDATE Reservation r SET r.status = :completedStatus WHERE r.status = :activeStatus AND r.endTime <= :now")
    int updateStatusForExpiredReservations(
            @Param("activeStatus") ReservationStatus activeStatus,
            @Param("completedStatus") ReservationStatus completedStatus,
            @Param("now") LocalDateTime now
    );
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
    @Query("SELECT r FROM Reservation r WHERE r.status = 'ACTIVE' AND r.notified = false AND r.endTime BETWEEN :now AND :targetTime")
    List<Reservation> findReservationsToNotify(
            @Param("now") LocalDateTime now,
            @Param("targetTime") LocalDateTime targetTime
    );
<<<<<<< HEAD

    @Query("SELECT DISTINCT r.parkingSpot FROM Reservation r WHERE r.status = 'ACTIVE' AND r.endTime > :now")
    List<ParkingSpot> findSpotsWithActiveReservations(@Param("now") LocalDateTime now);
}
=======
}
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
