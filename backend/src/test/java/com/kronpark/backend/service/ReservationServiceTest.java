package com.kronpark.backend.service;

import com.kronpark.backend.dto.ReservationRequest;
import com.kronpark.backend.dto.ReservationResponse;
import com.kronpark.backend.entity.*;
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.repository.*;
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

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock private ReservationRepository reservationRepository;
    @Mock private UserRepository userRepository;
    @Mock private ParkingSpotRepository parkingSpotRepository;
    @Mock private PrivateSpotRepository privateSpotRepository; // Trebuie adăugat Mock și aici

    @InjectMocks
    private ReservationService reservationService;

    private User testUser;
    private PrivateSpot testPrivateSpot; // Am schimbat în PrivateSpot conform noului Service
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @BeforeEach
    void setUp() {
        testUser = createTestUser(1L, "user@test.com");
        testPrivateSpot = createTestPrivateSpot(1L, "lot-centrala", "A1");
        startTime = LocalDateTime.now().plusHours(1);
        endTime = LocalDateTime.now().plusHours(2);
    }

    @Test
    void testCreateReservation_Success() {
        // ADAUGAT 1L
        ReservationRequest request = new ReservationRequest(1L, "A1", "lot-centrala", startTime, endTime);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
        when(privateSpotRepository.findById(1L)).thenReturn(Optional.of(testPrivateSpot));
        when(reservationRepository.existsOverlappingReservation(1L, startTime, endTime)).thenReturn(false);

        Reservation savedReservation = Reservation.builder()
                .id(1L)
                .user(testUser)
                .privateSpot(testPrivateSpot)
                .startTime(startTime)
                .endTime(endTime)
                .status(ReservationStatus.ACTIVE)
                .build();

        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);

        ReservationResponse response = reservationService.createReservation(request, "user@test.com");

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(ReservationStatus.ACTIVE);
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void testCreateReservation_FailsWhenStartTimeAfterEndTime() {
        LocalDateTime invalidStart = LocalDateTime.now().plusHours(3);
        LocalDateTime invalidEnd = LocalDateTime.now().plusHours(1);
        // ADAUGAT 1L
        ReservationRequest request = new ReservationRequest(1L, "A1", "lot-centrala", invalidStart, invalidEnd);

        assertThatThrownBy(() ->
                reservationService.createReservation(request, "user@test.com")
        ).isInstanceOf(IllegalArgumentException.class);

        verify(reservationRepository, never()).save(any());
    }

    private User createTestUser(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        return user;
    }

    private PrivateSpot createTestPrivateSpot(Long id, String lotId, String spotNumber) {
        PrivateSpot spot = new PrivateSpot();
        spot.setId(id);
        spot.setZone(lotId);
        spot.setOwnerName("Test Owner");
        spot.setStatus(SpotStatus.AVAILABLE);
        User owner = new User();
        owner.setEmail("owner@test.com");
        spot.setUser(owner);
        return spot;
    }
}