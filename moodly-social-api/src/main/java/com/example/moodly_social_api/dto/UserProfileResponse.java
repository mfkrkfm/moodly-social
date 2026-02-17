package com.example.moodly_social_api.dto;

import lombok.Data;

@Data
public class UserProfileResponse {

    private String username;
    private String name;
    private String surname;
    private String bio;
    private String avatarUrl;
    private Integer birthYear;
    private String moodColor;
}
