package com.kronpark.backend.controller;

import com.kronpark.backend.dto.UpdateUserRequest;
import com.kronpark.backend.dto.UserResponse;
import com.kronpark.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.kronpark.backend.dto.ChangePasswordRequest;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authService.getCurrentUser(authentication.getName());
    }
    @PutMapping("/profile")
    public UserResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request) {
        return authService.updateProfile(authentication.getName(), request);
    }
    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok().body("{\"message\": \"Parola a fost schimbată cu succes!\"}");
    }
}
