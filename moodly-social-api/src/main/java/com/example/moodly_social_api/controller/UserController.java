package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.user.UpdateUserRequest;
import com.example.moodly_social_api.dto.user.UserResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getMyUser(Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("GET /account - fetch user: userId={}", currentUserId);
        UserResponse user = userService.getUser(currentUserId);
        log.info("GET /account - user found: username={}", user.getUsername());
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateMyUser(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("PUT /account - update user: userId={}, username={}", currentUserId, request.getUsername());
        UserResponse updated = userService.updateUser(currentUserId, request);
        log.info("PUT /account - user updated: username={}", updated.getUsername());
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
