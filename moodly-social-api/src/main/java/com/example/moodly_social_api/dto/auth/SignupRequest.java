package com.example.moodly_social_api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank
    @Size(min = 4, max = 50)
    @Pattern(
        regexp = "^[A-Za-z0-9](?:[A-Za-z0-9._]{2,48}[A-Za-z0-9])?$",
        message = "Username may contain letters, numbers, dot, underscore; no spaces; 4-50 chars"
    )
    private String username;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @NotBlank
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,100}$"
    )
    private String password;
}
