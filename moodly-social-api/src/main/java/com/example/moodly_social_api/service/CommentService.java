package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.comment.CommentRequest;
import com.example.moodly_social_api.dto.comment.CommentResponse;
import com.example.moodly_social_api.entity.Comment;
import com.example.moodly_social_api.entity.Post;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.PostRepository;
import com.example.moodly_social_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Transactional
    public CommentResponse postComment(Long currentUserId, Long postId, CommentRequest request) {
        Profile profile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setEdited(false);
        comment.setPost(post);
        comment.setAuthor(profile);

        post.getComments().add(comment);
        postRepository.save(post);
        return toCommentResponse(comment);

    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new CustomException("Post not found", HttpStatus.NOT_FOUND));
    }

    private Profile getCurrentProfile(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }
        return profile;
    }

    private CommentResponse toCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setEdited(comment.isEdited());
        if (comment.getAuthor() != null && comment.getAuthor().getUser() != null) {
            response.setAuthorUsername(comment.getAuthor().getUser().getUsername());
        }
        return response;
    }

}
