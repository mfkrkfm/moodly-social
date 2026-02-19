package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.profile.UpdateProfileRequest;
import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfileInfo(Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        ProfileResponse profile = profileService.getProfileById(currentUserId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateMyProfileInfo(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        ProfileResponse updated = profileService.updateProfile(currentUserId, request);
        return ResponseEntity.ok(updated);
    }

    private Long getCurrentUserId(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new CustomException("Invalid token subject", HttpStatus.UNAUTHORIZED);
        }
    }
}
