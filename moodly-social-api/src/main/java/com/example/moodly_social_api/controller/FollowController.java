package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.follow.FollowResponse;
import com.example.moodly_social_api.exception.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class FollowController {

    @PostMapping("/{username}/followers")
    public ResponseEntity<FollowResponse> follow(
            Authentication authentication,
            @PathVariable String username
    ) {
        String currentUsername = authentication.getName();

        if (currentUsername.equals(username)) {
            throw new CustomException("You cannot follow yourself", HttpStatus.BAD_REQUEST);
        }
        throw new CustomException("Not implemented yet: follow", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/{username}/followers")
    public ResponseEntity<FollowResponse> unfollow(
            Authentication authentication,
            @PathVariable String username
    ) {
        String currentUsername = authentication.getName();

        if (currentUsername.equals(username)) {
            throw new CustomException("You cannot unfollow yourself", HttpStatus.BAD_REQUEST);
        }
        throw new CustomException("Not implemented yet: unfollow", HttpStatus.NOT_IMPLEMENTED);
    }
}
