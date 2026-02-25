package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicProfileResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicUserCardResponse;
import com.example.moodly_social_api.service.PublicProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/{username}")
@RequiredArgsConstructor
public class PublicProfileController {

    private final PublicProfileService publicProfileService;

    @GetMapping
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable String username) {
        log.info("GET /{} - fetch public profile", username);
        PublicProfileResponse response = publicProfileService.getPublicProfile(username);
        log.info("GET /{} - public profile found: username={}", username, response.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getUserPosts(@PathVariable String username) {
        log.info("GET /{}/posts - fetch user posts", username);
        List<PostResponse> response = publicProfileService.getUserPosts(username);
        log.info("GET /{}/posts - found {} posts", username, response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> getUserPostById(@PathVariable String username, @PathVariable Long postId) {
        log.info("GET /{}/posts/{} - fetch post", username, postId);
        PostResponse response = publicProfileService.getUserPostById(username, postId);
        log.info("GET /{}/posts/{} - post found", username, postId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/followers")
    public ResponseEntity<List<PublicUserCardResponse>> getFollowers(@PathVariable String username) {
        log.info("GET /{}/followers - fetch followers", username);
        List<PublicUserCardResponse> response = publicProfileService.getFollowers(username);
        log.info("GET /{}/followers - found {} followers", username, response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/following")
    public ResponseEntity<List<PublicUserCardResponse>> getFollowing(@PathVariable String username) {
        log.info("GET /{}/following - fetch following", username);
        List<PublicUserCardResponse> response = publicProfileService.getFollowing(username);
        log.info("GET /{}/following - found {} following", username, response.size());
        return ResponseEntity.ok(response);
    }
}
