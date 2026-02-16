package com.example.moodly_social_api.dto;

import com.example.moodly_social_api.entity.UserRole;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRolesRequest {

    @NotEmpty
    private Set<UserRole> roles;
}
