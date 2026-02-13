package com.example.moodly_social_api.dto;

import com.example.moodly_social_api.entity.UserRole;
import lombok.Data;
import java.util.List;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private List<UserRole> appUserRoles;
}
