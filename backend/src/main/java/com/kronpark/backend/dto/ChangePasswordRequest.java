package com.kronpark.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Parola veche este obligatorie")
        String oldPassword,

        @NotBlank(message = "Parola nouă este obligatorie")
        @Size(min = 8, max = 100, message = "Parola nouă trebuie să aibă între 8 și 100 de caractere")
        String newPassword
) {
}