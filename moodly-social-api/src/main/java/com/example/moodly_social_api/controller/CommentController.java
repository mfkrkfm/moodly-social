package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.comment.*;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        CommentResponse created = commentService.postComment(currentUserId, postId, request);
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
        CommentResponse reply = commentService.replyToComment(currentUserId, postId, commentId, request);
        return ResponseEntity.ok(reply);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(
            @PathVariable Long postId
    ) {
        List<CommentResponse> comments = commentService.getCommentsByPost(postId);
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
        CommentResponse updated = commentService.updateComment(currentUserId, postId, commentId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        commentService.deleteComment(currentUserId, postId, commentId);
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
