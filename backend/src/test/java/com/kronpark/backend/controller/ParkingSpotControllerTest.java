package com.kronpark.backend.controller;

import com.kronpark.backend.dto.ParkingSpotResponse;
import com.kronpark.backend.entity.SpotStatus;
import com.kronpark.backend.exception.GlobalExceptionHandler;
import com.kronpark.backend.service.ParkingSpotService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ParkingSpotController.class)
@AutoConfigureMockMvc
@Import(GlobalExceptionHandler.class)
class ParkingSpotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ParkingSpotService parkingSpotService;

    @Test
    void getAllSpotsShouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/parking-spots"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@kronpark.ro")
    void getAllSpotsShouldReturnSpotListWhenAuthenticated() throws Exception {
        when(parkingSpotService.getAllSpots()).thenReturn(List.of(
                new ParkingSpotResponse(1L, "A1", SpotStatus.AVAILABLE),
                new ParkingSpotResponse(2L, "A2", SpotStatus.OCCUPIED)
        ));

        mockMvc.perform(get("/api/parking-spots"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].spotNumber").value("A1"))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$[1].spotNumber").value("A2"))
                .andExpect(jsonPath("$[1].status").value("OCCUPIED"));
    }
}
