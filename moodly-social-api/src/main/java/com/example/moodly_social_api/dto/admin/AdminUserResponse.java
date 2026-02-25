package com.example.moodly_social_api.dto.admin;

import com.example.moodly_social_api.entity.UserRole;
import lombok.Data;

import java.util.List;

@Data
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private Long profileId;
    private List<UserRole> roles;

}
