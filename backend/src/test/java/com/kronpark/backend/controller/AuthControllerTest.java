package com.kronpark.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kronpark.backend.dto.AuthResponse;
import com.kronpark.backend.dto.LoginRequest;
import com.kronpark.backend.dto.RegisterRequest;
import com.kronpark.backend.dto.UserResponse;
import com.kronpark.backend.entity.UserRole;
import com.kronpark.backend.exception.DuplicateResourceException;
import com.kronpark.backend.exception.GlobalExceptionHandler;
import com.kronpark.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void registerShouldReturnCreatedForValidRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("Test User", "test@kronpark.ro", "parola123");
        AuthResponse response = new AuthResponse(
                "Account created successfully",
                new UserResponse(1L, "Test User", "test@kronpark.ro", UserRole.USER, null)
        );

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Account created successfully"))
                .andExpect(jsonPath("$.user.email").value("test@kronpark.ro"));
    }

    @Test
    void registerShouldReturnBadRequestForInvalidPayload() throws Exception {
        RegisterRequest request = new RegisterRequest("", "invalid-email", "123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.fullName").exists())
                .andExpect(jsonPath("$.validationErrors.email").exists())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    void registerShouldReturnConflictForDuplicateEmail() throws Exception {
        RegisterRequest request = new RegisterRequest("Test User", "test@kronpark.ro", "parola123");

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new DuplicateResourceException("An account with this email already exists"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with this email already exists"));
    }

    @Test
    void loginShouldReturnOkForValidRequest() throws Exception {
        LoginRequest request = new LoginRequest("test@kronpark.ro", "parola123");
        AuthResponse response = new AuthResponse(
                "Login successful",
                new UserResponse(1L, "Test User", "test@kronpark.ro", UserRole.USER, null)
        );

        when(authService.login(any(LoginRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.user.fullName").value("Test User"));
    }

    @Test
    void loginShouldReturnBadRequestForInvalidPayload() throws Exception {
        LoginRequest request = new LoginRequest("not-an-email", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.email").exists())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    void logoutShouldReturnNoContent() throws Exception {
        doNothing().when(authService).logout(any());

        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent());
    }
}
