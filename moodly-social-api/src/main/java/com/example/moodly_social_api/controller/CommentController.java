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
public class CommentController {

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            Authentication authentication,
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: createComment", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(
            @PathVariable Long postId
    ) {
        throw new CustomException("Not implemented yet: getCommentsByPost", HttpStatus.NOT_IMPLEMENTED);
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            Authentication authentication,
            @PathVariable Long commentId,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: updateComment", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            Authentication authentication,
            @PathVariable Long commentId
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: deleteComment", HttpStatus.NOT_IMPLEMENTED);
    }
}
