package com.kronpark.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "parking_spots", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"lot_id", "spot_number"})
})
public class ParkingSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lot_id", nullable = false)
    private String lotId;

    @Column(name = "spot_number", nullable = false, length = 10)
    private String spotNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SpotStatus status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLotId() { return lotId; }
    public void setLotId(String lotId) { this.lotId = lotId; }

    public String getSpotNumber() { return spotNumber; }
    public void setSpotNumber(String spotNumber) { this.spotNumber = spotNumber; }

    public SpotStatus getStatus() { return status; }
    public void setStatus(SpotStatus status) { this.status = status; }
}