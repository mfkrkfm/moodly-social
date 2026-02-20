package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.user.UpdateUserRequest;
import com.example.moodly_social_api.dto.user.UserResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getMyUser(Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        UserResponse user = userService.getUser(currentUserId);
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateMyUser(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        UserResponse updated = userService.updateUser(currentUserId, request);
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
