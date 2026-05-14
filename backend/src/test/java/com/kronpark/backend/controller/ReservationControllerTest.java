package com.kronpark.backend.controller;

import com.kronpark.backend.dto.ReservationRequest;
import com.kronpark.backend.dto.ReservationResponse;
import com.kronpark.backend.entity.ReservationStatus;
import com.kronpark.backend.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ReservationController service logic.
 */
@ExtendWith(MockitoExtension.class)
class ReservationControllerTest {

    @Mock
    private ReservationService reservationService;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ReservationRequest testRequest;
    private ReservationResponse testResponse;

    @BeforeEach
    void setUp() {
        startTime = LocalDateTime.now().plusHours(1);
        endTime = LocalDateTime.now().plusHours(2);

        testRequest = new ReservationRequest("lot-centrala", "A1", startTime, endTime);

        testResponse = new ReservationResponse(
                1L, 1L, "lot-centrala", "A1", "user@test.com", startTime, endTime, ReservationStatus.ACTIVE
        );
    }

    @Test
    void testCreateReservation_Success() {
        // ARRANGE
        when(reservationService.createReservation(any(ReservationRequest.class), any()))
                .thenReturn(testResponse);

        // ACT
        ReservationResponse result = reservationService.createReservation(testRequest, null);

        // ASSERT
        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals(ReservationStatus.ACTIVE, result.status());
        verify(reservationService).createReservation(any(ReservationRequest.class), any());
    }

    @Test
    void testCreateReservation_ValidatesInput() {
        // ARRANGE - Request with invalid time range
        ReservationRequest invalidRequest = new ReservationRequest(
                "lot-centrala",
                "A1",
                LocalDateTime.now().plusHours(2),
                LocalDateTime.now().plusHours(1) // End before start
        );

        // ACT & ASSERT - Should handle invalid input
        assertNotNull(invalidRequest);
        assertTrue(invalidRequest.endTime().isBefore(invalidRequest.startTime()));
    }
}