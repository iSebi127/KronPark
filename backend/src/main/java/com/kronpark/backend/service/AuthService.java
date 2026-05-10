package com.kronpark.backend.service;

import com.kronpark.backend.dto.*;
import com.kronpark.backend.entity.User;
import com.kronpark.backend.entity.UserRole;
import com.kronpark.backend.exception.DuplicateResourceException;
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.kronpark.backend.dto.ChangePasswordRequest;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        // 1. Găsim userul
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Verificăm dacă parola veche este corectă
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Parola veche este incorectă!");
        }

        // 3. Criptăm și setăm noua parolă
        user.setPassword(passwordEncoder.encode(request.newPassword()));

        // 4. Salvăm modificarea
        userRepository.save(user);
    }
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return new AuthResponse("Account created successfully", UserResponse.from(savedUser), token);
    }
    @Transactional
    public UserResponse updateProfile(String currentEmail, UpdateUserRequest request) {

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newEmail = request.email().trim().toLowerCase();

        if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        user.setFullName(request.fullName().trim());
        user.setEmail(newEmail);

        User updatedUser = userRepository.save(user);

        return UserResponse.from(updatedUser);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(),
                        request.password()
                )
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);

        return new AuthResponse("Login successful", UserResponse.from(user), token);
    }

    public void logout() {
        SecurityContextHolder.clearContext();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user was not found"));
        return UserResponse.from(user);
    }
}
