package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.post.PostRequest;
import com.example.moodly_social_api.dto.post.LikeResponse;
import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.exception.CustomException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            Authentication authentication,
            @Valid @RequestBody PostRequest request
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: createPost", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getFeed(Authentication authentication) {
        String currentUsername = authentication != null ? authentication.getName() : "anonymous";
        throw new CustomException("Not implemented yet: getFeed", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        String currentUsername = authentication != null ? authentication.getName() : "anonymous";
        throw new CustomException("Not implemented yet: getPostById", HttpStatus.NOT_IMPLEMENTED);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            Authentication authentication,
            @PathVariable Long postId,
            @Valid @RequestBody PostRequest request
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: updatePost", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: deletePost", HttpStatus.NOT_IMPLEMENTED);
    }

    // Likes

    @PostMapping("/{postId}/likes")
    public ResponseEntity<LikeResponse> likePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: likePost", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/{postId}/likes")
    public ResponseEntity<LikeResponse> unlikePost(
            Authentication authentication,
            @PathVariable Long postId
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: unlikePost", HttpStatus.NOT_IMPLEMENTED);
    }

    // Pictures

    @PostMapping(
            value = "/{postId}/pictures",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<PostResponse> uploadPictures(
            Authentication authentication,
            @PathVariable Long postId,
            @RequestParam("files") List<MultipartFile> files
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: uploadPictures", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/{postId}/pictures/{pictureId}")
    public ResponseEntity<PostResponse> deletePicture(
            Authentication authentication,
            @PathVariable Long postId,
            @PathVariable Long pictureId
    ) {
        String currentUsername = authentication.getName();
        throw new CustomException("Not implemented yet: deletePicture", HttpStatus.NOT_IMPLEMENTED);
    }
}
