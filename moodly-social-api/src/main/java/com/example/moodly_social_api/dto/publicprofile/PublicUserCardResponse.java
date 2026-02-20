package com.example.moodly_social_api.dto.publicprofile;

import lombok.Data;

@Data
public class PublicUserCardResponse {
    private String username;
    private String name;
    private String surname;
    private String avatarUrl;
}
