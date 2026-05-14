package com.kronpark.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Am scos optional = false pentru că acum avem două tipuri de locuri
    @ManyToOne
    @JoinColumn(name = "parking_spot_id", nullable = true)
    private ParkingSpot parkingSpot;

    // ADAUGĂ ACEST CÂMP pentru locurile private
    @ManyToOne
    @JoinColumn(name = "private_spot_id", nullable = true)
    private PrivateSpot privateSpot;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;

    @Column(name = "is_notified", nullable = false)
    private boolean notified = false;
}