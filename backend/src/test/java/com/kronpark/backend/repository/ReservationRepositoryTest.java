package com.kronpark.backend.repository;

import com.kronpark.backend.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for ReservationRepository.
 * Tests database queries using Spring Boot test context.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ReservationRepositoryTest {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    @Test
    void testExistsOverlappingReservation_NoReservations() {
        // Create test data with unique spot number
        User user = createTestUser("user1@test.com");
        ParkingSpot spot = createTestSpot("TEST-A1");

        // Test with no reservations
        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                spot.getId(),
                LocalDateTime.now().plusHours(1),
                LocalDateTime.now().plusHours(2)
        );

        assertThat(hasOverlap).isFalse();
    }

    @Test
    void testExistsOverlappingReservation_WithOverlap() {
        // Create test data with unique spot number
        User user = createTestUser("user2@test.com");
        ParkingSpot spot = createTestSpot("TEST-A2");

        LocalDateTime now = LocalDateTime.now();

        // Create overlapping reservation
        Reservation existing = Reservation.builder()
                .user(user)
                .parkingSpot(spot)
                .startTime(now.plusHours(1))
                .endTime(now.plusHours(3))
                .status(ReservationStatus.ACTIVE)
                .build();
        reservationRepository.save(existing);

        // Test overlapping time
        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                spot.getId(),
                now.plusHours(1).plusMinutes(30),
                now.plusHours(2).plusMinutes(30)
        );

        assertThat(hasOverlap).isTrue();
    }

    @Test
    void testFindByUserId_Success() {
        // Create test data with unique spot number
        User user = createTestUser("user3@test.com");
        ParkingSpot spot = createTestSpot("TEST-A3");

        LocalDateTime now = LocalDateTime.now();

        // Create reservations
        Reservation res1 = Reservation.builder()
                .user(user)
                .parkingSpot(spot)
                .startTime(now.plusHours(1))
                .endTime(now.plusHours(2))
                .status(ReservationStatus.ACTIVE)
                .build();

        Reservation res2 = Reservation.builder()
                .user(user)
                .parkingSpot(spot)
                .startTime(now.plusHours(3))
                .endTime(now.plusHours(4))
                .status(ReservationStatus.ACTIVE)
                .build();

        reservationRepository.saveAll(List.of(res1, res2));

        // Test
        List<Reservation> found = reservationRepository.findByUserId(user.getId());

        assertThat(found).hasSize(2);
    }

    private User createTestUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setFullName("Test User");
        user.setPassword("password");
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    private ParkingSpot createTestSpot(String spotNumber) {
        ParkingSpot spot = new ParkingSpot();
        spot.setSpotNumber(spotNumber);
        spot.setStatus(SpotStatus.AVAILABLE);
        return parkingSpotRepository.save(spot);
    }
}
