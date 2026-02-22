package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.profile.UpdateProfileRequest;
import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfileInfo(Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("GET /profile - fetch profile: userId={}", currentUserId);
        ProfileResponse profile = profileService.getProfileById(currentUserId);
        log.info("GET /profile - profile found: username={}", profile.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateMyProfileInfo(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("PUT /profile - update profile: userId={}", currentUserId);
        ProfileResponse updated = profileService.updateProfile(currentUserId, request);
        log.info("PUT /profile - profile updated: username={}", updated.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/picture")
    public ResponseEntity<ProfileResponse> updateMyProfilePicture(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("PUT /profile/picture - update picture: userId={}, fileName={}", currentUserId, file.getOriginalFilename());
        ProfileResponse updated = profileService.updateProfilePicture(currentUserId, file);
        log.info("PUT /profile/picture - picture updated: username={}", updated.getUsername());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/picture")
    public ResponseEntity<ProfileResponse> deleteMyProfilePicture(Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("DELETE /profile/picture - delete picture: userId={}", currentUserId);
        ProfileResponse updated = profileService.deleteProfilePicture(currentUserId);
        log.info("DELETE /profile/picture - picture deleted: username={}", updated.getUsername());
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
