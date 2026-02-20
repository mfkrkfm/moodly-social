package com.example.moodly_social_api.dto.publicprofile;

import lombok.Data;

@Data
public class PublicProfileResponse {
    private String username;

    private String name;
    private String surname;
    private String bio;
    private String avatarUrl;
    private String moodColor;

    private int followersCount;
    private int followingCount;
}
