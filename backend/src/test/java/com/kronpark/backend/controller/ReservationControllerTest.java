package com.kronpark.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kronpark.backend.dto.ReservationRequest;
import com.kronpark.backend.dto.ReservationResponse;
import com.kronpark.backend.entity.ReservationStatus;
import com.kronpark.backend.exception.GlobalExceptionHandler;
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.service.ReservationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservationController.class)
@AutoConfigureMockMvc
@Import(GlobalExceptionHandler.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReservationService reservationService;

    @Test
    void createReservationShouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
        ReservationRequest request = new ReservationRequest(
                1L,
                LocalDateTime.now().plusHours(1),
                LocalDateTime.now().plusHours(2)
        );

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@kronpark.ro")
    void createReservationShouldReturnCreatedForValidRequest() throws Exception {
        ReservationRequest request = new ReservationRequest(
                1L,
                LocalDateTime.now().plusHours(1),
                LocalDateTime.now().plusHours(2)
        );

        ReservationResponse response = new ReservationResponse(
                10L,
                1L,
                "A1",
                "test@kronpark.ro",
                request.startTime(),
                request.endTime(),
                ReservationStatus.ACTIVE
        );

        when(reservationService.createReservation(any(ReservationRequest.class), eq("test@kronpark.ro")))
                .thenReturn(response);

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.spotNumber").value("A1"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(username = "test@kronpark.ro")
    void createReservationShouldReturnBadRequestForInvalidTimes() throws Exception {
        ReservationRequest request = new ReservationRequest(
                1L,
                LocalDateTime.now().minusHours(1),
                LocalDateTime.now().plusHours(2)
        );

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.startTime").exists());
    }

    @Test
    @WithMockUser(username = "test@kronpark.ro")
    void createReservationShouldReturnNotFoundForMissingSpot() throws Exception {
        ReservationRequest request = new ReservationRequest(
                999L,
                LocalDateTime.now().plusHours(1),
                LocalDateTime.now().plusHours(2)
        );

        when(reservationService.createReservation(any(ReservationRequest.class), eq("test@kronpark.ro")))
                .thenThrow(new ResourceNotFoundException("Parking spot not found"));

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Parking spot not found"));
    }

    @Test
    @WithMockUser(username = "test@kronpark.ro")
    void getMyReservationsShouldReturnUserReservations() throws Exception {
        when(reservationService.getMyReservations("test@kronpark.ro")).thenReturn(List.of(
                new ReservationResponse(
                        10L,
                        1L,
                        "A1",
                        "test@kronpark.ro",
                        LocalDateTime.now().plusHours(1),
                        LocalDateTime.now().plusHours(2),
                        ReservationStatus.ACTIVE
                )
        ));

        mockMvc.perform(get("/api/reservations/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].spotNumber").value("A1"))
                .andExpect(jsonPath("$[0].userEmail").value("test@kronpark.ro"));
    }
}
