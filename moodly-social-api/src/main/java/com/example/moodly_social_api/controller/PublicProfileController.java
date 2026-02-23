package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicProfileResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicUserCardResponse;
import com.example.moodly_social_api.service.PublicProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/{username}")
@RequiredArgsConstructor
public class PublicProfileController {

    private final PublicProfileService publicProfileService;

    @GetMapping
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable String username) {
        PublicProfileResponse response = publicProfileService.getPublicProfile(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getUserPosts(@PathVariable String username) {
        List<PostResponse> response = publicProfileService.getUserPosts(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> getUserPostById(@PathVariable String username, @PathVariable Long postId) {
        PostResponse response = publicProfileService.getUserPostById(username, postId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/followers")
    public ResponseEntity<List<PublicUserCardResponse>> getFollowers(@PathVariable String username) {
        List<PublicUserCardResponse> response = publicProfileService.getFollowers(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/following")
    public ResponseEntity<List<PublicUserCardResponse>> getFollowing(@PathVariable String username) {
        List<PublicUserCardResponse> response = publicProfileService.getFollowing(username);
        return ResponseEntity.ok(response);
    }
}
