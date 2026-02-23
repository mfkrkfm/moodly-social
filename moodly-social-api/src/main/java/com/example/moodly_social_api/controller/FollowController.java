package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.follow.FollowResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.PublicProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/{username}/followers")
@RequiredArgsConstructor
public class FollowController {

    private final PublicProfileService publicProfileService;

    @PostMapping
    public ResponseEntity<FollowResponse> follow(
            Authentication authentication,
            @PathVariable String username
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        FollowResponse response = publicProfileService.follow(currentUserId, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<FollowResponse> unfollow(
            Authentication authentication,
            @PathVariable String username
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        FollowResponse response = publicProfileService.unfollow(currentUserId, username);
        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new CustomException("Invalid token subject", HttpStatus.UNAUTHORIZED);
        }
    }
}
