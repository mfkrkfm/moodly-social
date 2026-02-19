package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicProfileResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicUserCardResponse;
import com.example.moodly_social_api.exception.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/u")
public class PublicProfileController {

    @GetMapping("/{username}")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable String username) {
        throw new CustomException("Not implemented yet: getPublicProfile", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<List<PostResponse>> getUserPosts(@PathVariable String username) {
        throw new CustomException("Not implemented yet: getUserPosts", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<PublicUserCardResponse>> getFollowers(@PathVariable String username) {
        throw new CustomException("Not implemented yet: getFollowers", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<PublicUserCardResponse>> getFollowing(@PathVariable String username) {
        throw new CustomException("Not implemented yet: getFollowing", HttpStatus.NOT_IMPLEMENTED);
    }
}
