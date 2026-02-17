package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.UpdateProfileInfoRequest;
import com.example.moodly_social_api.dto.UserProfileResponse;
import com.example.moodly_social_api.exception.CustomException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfileInfo(Authentication authentication) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: getMyProfileInfo for " + currentUsername, HttpStatus.NOT_IMPLEMENTED);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfileInfo(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileInfoRequest request
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: updateMyProfileInfo for " + currentUsername, HttpStatus.NOT_IMPLEMENTED);
    }
}
