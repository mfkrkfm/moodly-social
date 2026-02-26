package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.follow.FollowResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.PublicProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/users/{username}/followers")
@RequiredArgsConstructor
public class FollowController {

    private final PublicProfileService publicProfileService;

    @PostMapping
    public ResponseEntity<FollowResponse> follow(
            Authentication authentication,
            @PathVariable String username
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("POST /users/{}/followers - follow: userId={}", username, currentUserId);
        FollowResponse response = publicProfileService.follow(currentUserId, username);
        log.info("POST /users/{}/followers - followed successfully: userId={}", username, currentUserId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<FollowResponse> unfollow(
            Authentication authentication,
            @PathVariable String username
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("DELETE /users/{}/followers - unfollow: userId={}", username, currentUserId);
        FollowResponse response = publicProfileService.unfollow(currentUserId, username);
        log.info("DELETE /users/{}/followers - unfollowed successfully: userId={}", username, currentUserId);
        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            log.warn("Invalid token subject: {}", authentication.getName());
            throw new CustomException("Invalid token subject", HttpStatus.UNAUTHORIZED);
        }
    }
}
