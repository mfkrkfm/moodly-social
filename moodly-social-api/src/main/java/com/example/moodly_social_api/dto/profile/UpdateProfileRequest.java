package com.example.moodly_social_api.dto.profile;

import com.example.moodly_social_api.entity.Mood;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Pattern(
        regexp = "^(?=.{1,100}$)[\\p{L}\\p{M}]+(?:[ '\\-][\\p{L}\\p{M}]+)*$",
        message = "First name contains invalid characters"
    )
    @Size(max = 100)
    private String firstName;

    @Pattern(
        regexp = "^(?=.{1,100}$)[\\p{L}\\p{M}]+(?:[ '\\-][\\p{L}\\p{M}]+)*$",
        message = "Last name contains invalid characters"
    )
    @Size(max = 100)
    private String lastName;

    @Size(max = 500)
    private String bio;

    @Past
    private LocalDate birthDate;

    private Mood mood;
}
