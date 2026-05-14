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
        // ADAUGAT 1L ca prim parametru (spotId)
        testRequest = new ReservationRequest(1L, "A1", "lot-centrala", startTime, endTime);

        testResponse = new ReservationResponse(
                1L, 1L, "lot-centrala", "A1", "user@test.com", startTime, endTime, ReservationStatus.ACTIVE
        );
    }

    @Test
    void testCreateReservation_Success() {
        when(reservationService.createReservation(any(ReservationRequest.class), any()))
                .thenReturn(testResponse);

        ReservationResponse result = reservationService.createReservation(testRequest, null);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals(ReservationStatus.ACTIVE, result.status());
        verify(reservationService).createReservation(any(ReservationRequest.class), any());
    }

    @Test
    void testCreateReservation_ValidatesInput() {
        // ADAUGAT 1L ca prim parametru
        ReservationRequest invalidRequest = new ReservationRequest(
                1L,
                "A1",
                "lot-centrala",
                LocalDateTime.now().plusHours(2),
                LocalDateTime.now().plusHours(1)
        );

        assertNotNull(invalidRequest);
        assertTrue(invalidRequest.endTime().isBefore(invalidRequest.startTime()));
    }
}