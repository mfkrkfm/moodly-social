package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.post.PostRequest;
import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPost(
            Authentication authentication,
            @RequestPart("post") @Valid PostRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        PostResponse created = postService.createPost(currentUserId, request, files);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getFeed(Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        List<PostResponse> feed = postService.getFeed(currentUserId);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        PostResponse post = postService.getPostById(postId, currentUserId);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            Authentication authentication,
            @PathVariable Long postId,
            @Valid @RequestBody PostRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        PostResponse updated = postService.updatePost(currentUserId, postId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        postService.deletePost(currentUserId, postId);
        return ResponseEntity.noContent().build();
    }

    // Likes

    @PostMapping("/{postId}/likes")
    public ResponseEntity<PostResponse> likePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        PostResponse response = postService.likePost(currentUserId, postId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{postId}/likes")
    public ResponseEntity<PostResponse> unlikePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        PostResponse response = postService.unlikePost(currentUserId, postId);
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
