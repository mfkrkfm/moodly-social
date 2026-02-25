package com.example.moodly_social_api.dto.profile;

import com.example.moodly_social_api.entity.Mood;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 500)
    private String bio;

    @Past
    private LocalDate birthDate;

    private Mood mood;

}
