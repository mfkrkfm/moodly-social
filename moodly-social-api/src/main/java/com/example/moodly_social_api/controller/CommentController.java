package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.comment.*;
import com.example.moodly_social_api.exception.CustomException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts/{postId}/comments/")
public class CommentController {

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            Authentication authentication,
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        throw new CustomException("Not implemented yet: createComment", HttpStatus.NOT_IMPLEMENTED);
    }

    @PostMapping("/{commentId}")
    public ResponseEntity<CommentResponse> replyToComment(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        throw new CustomException("Not implemented yet: replyToComment", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(
            @PathVariable Long postId
    ) {
        throw new CustomException("Not implemented yet: getCommentsByPost", HttpStatus.NOT_IMPLEMENTED);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        throw new CustomException("Not implemented yet: updateComment", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("{commentId}")
    public ResponseEntity<Void> deleteComment(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) {
        Long currentUserId = getCurrentUserId(authentication);
        throw new CustomException("Not implemented yet: deleteComment", HttpStatus.NOT_IMPLEMENTED);
    }

    private Long getCurrentUserId(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new CustomException("Invalid token subject", HttpStatus.UNAUTHORIZED);
        }
    }
}
