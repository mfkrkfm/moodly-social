package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.post.PostRequest;
import com.example.moodly_social_api.dto.post.LikeResponse;
import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
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
        log.info("POST /posts - create post: userId={}, mood={}, filesCount={}", currentUserId, request.getMood(), files != null ? files.size() : 0);
        PostResponse created = postService.createPost(currentUserId, request, files);
        log.info("POST /posts - post created: postId={}", created.getId());
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getFeed(Authentication authentication) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("GET /posts - fetch feed: userId={}", currentUserId);
        List<PostResponse> feed = postService.getFeed(currentUserId);
        log.info("GET /posts - returned {} posts", feed.size());
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("GET /posts/{} - fetch post: userId={}", postId, currentUserId);
        PostResponse post = postService.getPostById(postId, currentUserId);
        log.info("GET /posts/{} - post found", postId);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            Authentication authentication,
            @PathVariable Long postId,
            @Valid @RequestBody PostRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("PUT /posts/{} - update post: userId={}", postId, currentUserId);
        PostResponse updated = postService.updatePost(currentUserId, postId, request);
        log.info("PUT /posts/{} - post updated", postId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("DELETE /posts/{} - delete post: userId={}", postId, currentUserId);
        postService.deletePost(currentUserId, postId);
        log.info("DELETE /posts/{} - post deleted", postId);
        return ResponseEntity.ok().build();
    }

    // Likes

    @PostMapping("/{postId}/likes")
    public ResponseEntity<LikeResponse> likePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("POST /posts/{}/likes - like post: userId={}", postId, currentUserId);
        LikeResponse response = postService.likePost(currentUserId, postId);
        log.info("POST /posts/{}/likes - post liked", postId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{postId}/likes")
    public ResponseEntity<LikeResponse> unlikePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("DELETE /posts/{}/likes - unlike post: userId={}", postId, currentUserId);
        LikeResponse response = postService.unlikePost(currentUserId, postId);
        log.info("DELETE /posts/{}/likes - post unliked", postId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/likes")
    public ResponseEntity<List<ProfileResponse>> getPostLikes(
            @PathVariable Long postId
    ) {
        log.info("GET /posts/{}/likes - fetch likes list", postId);
        List<ProfileResponse> likes = postService.getPostLikes(postId);
        log.info("GET /posts/{}/likes - returned {} likes", postId, likes.size());
        return ResponseEntity.ok(likes);
    }

    private Long getCurrentUserId(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new CustomException("Invalid token subject", HttpStatus.UNAUTHORIZED);
        }
    }
}
