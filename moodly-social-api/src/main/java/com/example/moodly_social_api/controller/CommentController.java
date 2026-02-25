package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.comment.*;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            Authentication authentication,
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("POST /posts/{}/comments - create comment: userId={}", postId, currentUserId);
        CommentResponse created = commentService.postComment(currentUserId, postId, request);
        log.info("POST /posts/{}/comments - comment created: commentId={}", postId, created.getId());
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{commentId}")
    public ResponseEntity<CommentResponse> replyToComment(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("POST /posts/{}/comments/{} - reply to comment: userId={}", postId, commentId, currentUserId);
        CommentResponse reply = commentService.replyToComment(currentUserId, postId, commentId, request);
        log.info("POST /posts/{}/comments/{} - reply created: replyId={}", postId, commentId, reply.getId());
        return ResponseEntity.ok(reply);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(
            @PathVariable Long postId
    ) {
        log.info("GET /posts/{}/comments - fetch comments", postId);
        List<CommentResponse> comments = commentService.getCommentsByPost(postId);
        log.info("GET /posts/{}/comments - returned {} comments", postId, comments.size());
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("PUT /posts/{}/comments/{} - update comment: userId={}", postId, commentId, currentUserId);
        CommentResponse updated = commentService.updateComment(currentUserId, postId, commentId, request);
        log.info("PUT /posts/{}/comments/{} - comment updated", postId, commentId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        log.info("DELETE /posts/{}/comments/{} - delete comment: userId={}", postId, commentId, currentUserId);
        commentService.deleteComment(currentUserId, postId, commentId);
        log.info("DELETE /posts/{}/comments/{} - comment deleted", postId, commentId);
        return ResponseEntity.noContent().build();
    }

    private Long getCurrentUserId(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new CustomException("Invalid token subject", HttpStatus.UNAUTHORIZED);
        }
    }
}
