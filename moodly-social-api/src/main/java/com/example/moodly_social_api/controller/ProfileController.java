package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.UpdateProfileRequest;
import com.example.moodly_social_api.dto.UserResponse;
import com.example.moodly_social_api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        String currentUsername = authentication.getName();
        UserResponse profile = userService.getProfile(currentUsername);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String currentUsername = authentication.getName();
        UserResponse updated = userService.updateProfile(currentUsername, request);
        return ResponseEntity.ok(updated);
    }
}
