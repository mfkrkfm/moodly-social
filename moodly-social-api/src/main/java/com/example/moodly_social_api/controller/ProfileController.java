package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.UpdateProfileRequest;
import com.example.moodly_social_api.dto.ProfileResponse;
import com.example.moodly_social_api.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/me/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfileInfo(Authentication authentication) {
        String currentUsername = authentication.getName();
        ProfileResponse profile = profileService.getProfile(currentUsername);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateMyProfileInfo(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String currentUsername = authentication.getName();
        ProfileResponse updated = profileService.updateProfile(currentUsername, request);
        return ResponseEntity.ok(updated);
    }
}
