package com.kronpark.backend.service;

import com.kronpark.backend.dto.ReservationRequest;
import com.kronpark.backend.dto.ReservationResponse;
import com.kronpark.backend.entity.*;
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.repository.ReservationRepository;
import com.kronpark.backend.repository.UserRepository;
import com.kronpark.backend.repository.ParkingSpotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ReservationService.
 * Tests the business logic with mocked dependencies.
 */
@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParkingSpotRepository parkingSpotRepository;

    @InjectMocks
    private ReservationService reservationService;

    private User testUser;
    private ParkingSpot testSpot;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @BeforeEach
    void setUp() {
        testUser = createTestUser(1L, "user@test.com");
        testSpot = createTestSpot(1L, "lot-centrala", "A1");
        startTime = LocalDateTime.now().plusHours(1);
        endTime = LocalDateTime.now().plusHours(2);
    }

    @Test
    void testCreateReservation_Success() {
        // ARRANGE
        ReservationRequest request = new ReservationRequest("lot-centrala", "A1", startTime, endTime);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));

        when(parkingSpotRepository.findByLotIdAndSpotNumber("lot-centrala", "A1")).thenReturn(Optional.of(testSpot));

        when(reservationRepository.existsOverlappingReservation(1L, startTime, endTime))
                .thenReturn(false);

        Reservation savedReservation = Reservation.builder()
                .id(1L)
                .user(testUser)
                .parkingSpot(testSpot)
                .startTime(startTime)
                .endTime(endTime)
                .status(ReservationStatus.ACTIVE)
                .build();

        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);

        // ACT
        ReservationResponse response = reservationService.createReservation(request, "user@test.com");

        // ASSERT
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(ReservationStatus.ACTIVE);
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void testCreateReservation_FailsWhenStartTimeAfterEndTime() {
        // ARRANGE
        LocalDateTime invalidStart = LocalDateTime.now().plusHours(3);
        LocalDateTime invalidEnd = LocalDateTime.now().plusHours(1);
        ReservationRequest request = new ReservationRequest("lot-centrala", "A1", invalidStart, invalidEnd);

        // ACT & ASSERT
        assertThatThrownBy(() ->
                reservationService.createReservation(request, "user@test.com")
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Start time must be before end time");

        verify(reservationRepository, never()).save(any());
    }

    @Test
    void testCreateReservation_FailsWhenUserNotFound() {
        // ARRANGE
        ReservationRequest request = new ReservationRequest("lot-centrala", "A1", startTime, endTime);
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThatThrownBy(() ->
                reservationService.createReservation(request, "unknown@test.com")
        ).isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");

        verify(reservationRepository, never()).save(any());
    }

    @Test
    void testCreateReservation_FailsWhenSpotAlreadyReserved() {
        // ARRANGE
        ReservationRequest request = new ReservationRequest("lot-centrala", "A1", startTime, endTime);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));

        when(parkingSpotRepository.findByLotIdAndSpotNumber("lot-centrala", "A1")).thenReturn(Optional.of(testSpot));

        when(reservationRepository.existsOverlappingReservation(1L, startTime, endTime))
                .thenReturn(true); // Already reserved!

        // ACT & ASSERT
        assertThatThrownBy(() ->
                reservationService.createReservation(request, "user@test.com")
        ).isInstanceOf(IllegalStateException.class)
                .hasMessage("The parking spot is already reserved for this interval");

        verify(reservationRepository, never()).save(any());
    }

    private User createTestUser(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setFullName("Test User");
        user.setPassword("password");
        user.setRole(UserRole.USER);
        return user;
    }

    private ParkingSpot createTestSpot(Long id, String lotId, String spotNumber) {
        ParkingSpot spot = new ParkingSpot();
        spot.setId(id);
        spot.setLotId(lotId);
        spot.setSpotNumber(spotNumber);
        spot.setStatus(SpotStatus.AVAILABLE);
        return spot;
    }
}