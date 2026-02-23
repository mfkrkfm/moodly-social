package com.example.moodly_social_api.dto.auth;

import lombok.Data;

import java.util.List;

@Data
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private List<String> roles;
    private Long profileId;

    public AuthResponse(String token,
                        Long userId,
                        String username,
                        String email,
                        List<String> roles,
                        Long profileId) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.profileId = profileId;
    }
}
