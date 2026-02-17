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
@RequestMapping("/me/account")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getMyUser(Authentication authentication) {
        String currentUsername = authentication.getName();
        UserResponse profile = userService.getUser(currentUsername);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateMyUser(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String currentUsername = authentication.getName();
        UserResponse updated = userService.updateUser(currentUsername, request);
        return ResponseEntity.ok(updated);
    }
}
