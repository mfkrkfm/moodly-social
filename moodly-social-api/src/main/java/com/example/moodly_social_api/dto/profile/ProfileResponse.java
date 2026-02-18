package com.example.moodly_social_api.dto.profile;

import com.example.moodly_social_api.entity.Mood;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileResponse {

    private String firstName;
    private String lastName;
    private String bio;
    private LocalDate birthDate;
    private Mood mood;
}
