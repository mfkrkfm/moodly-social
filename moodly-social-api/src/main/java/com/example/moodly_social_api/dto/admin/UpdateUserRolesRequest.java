package com.example.moodly_social_api.dto.admin;

import com.example.moodly_social_api.entity.UserRole;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class UpdateUserRolesRequest {

    @NotEmpty
    private List<UserRole> roles;
}
