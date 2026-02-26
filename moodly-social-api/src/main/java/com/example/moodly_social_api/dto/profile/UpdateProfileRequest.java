package com.example.moodly_social_api.dto.profile;

import com.example.moodly_social_api.entity.Mood;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    @Size(max = 100)
    @Pattern(regexp = "^[a-zA-Zа-яА-ЯёЁ\\s\\-']*$", message = "First name can only contain letters, spaces, hyphens and apostrophes")
    private String firstName;

    @Size(max = 100)
    @Pattern(regexp = "^[a-zA-Zа-яА-ЯёЁ\\s\\-']*$", message = "Last name can only contain letters, spaces, hyphens and apostrophes")
    private String lastName;

    @Size(max = 500)
    private String bio;

    @Past(message = "Birth date must be in the past")
    private LocalDate birthDate;

    private Mood mood;

}
