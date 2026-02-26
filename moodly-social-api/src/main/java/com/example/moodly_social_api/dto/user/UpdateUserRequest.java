package com.example.moodly_social_api.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank
    @Size(min = 4, max = 50)
    @Pattern(regexp = "^[a-zA-Z0-9_-]*$", message = "Username can only contain English letters, numbers, underscores and hyphens")
    private String username;

    @NotBlank
    @Email(message = "Email must be a valid email address")
    @Size(max = 100)
    private String email;

    @Size(min = 8, max = 100)
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,100}$",
            message = "Password must contain digit, lowercase, uppercase, special char, and no spaces"
    )
    private String newPassword;
}
