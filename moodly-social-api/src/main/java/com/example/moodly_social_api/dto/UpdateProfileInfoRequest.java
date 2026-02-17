package com.example.moodly_social_api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileInfoRequest {

    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String surname;

    @Size(max = 500)
    private String bio;

    @Size(max = 255)
    private String avatarUrl;

    @Min(1900)
    @Max(2100)
    private Integer birthYear;

}
