package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.comment.CommentRequest;
import com.example.moodly_social_api.dto.comment.CommentResponse;
import com.example.moodly_social_api.entity.Comment;
import com.example.moodly_social_api.entity.Post;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.repository.CommentRepository;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.PostRepository;
import com.example.moodly_social_api.repository.UserRepository;
import com.example.moodly_social_api.service.mapper.CommentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

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

        commentRepository.save(comment);
        return commentMapper.toCommentResponse(comment);
    }

    @Transactional
    public CommentResponse replyToComment(Long currentUserId, Long postId, Long parentCommentId, CommentRequest request) {
        Profile profile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);
        Comment parentComment = getComment(postId, parentCommentId);

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setEdited(false);
        comment.setPost(post);
        comment.setAuthor(profile);
        comment.setParentComment(parentComment);

        commentRepository.save(comment);
        return commentMapper.toCommentResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPost(Long postId) {
        getPost(postId);
        List<Comment> comments = commentRepository.findAllByPost_IdOrderByCreatedAtAsc(postId);
        return commentMapper.toCommentTree(comments);
    }

    @Transactional
    public CommentResponse updateComment(Long currentUserId, Long postId, Long commentId, CommentRequest request) {
        Profile profile = getCurrentProfile(currentUserId);
        Comment comment = getComment(postId, commentId);
        validateCommentAuthor(comment, profile);

        comment.setContent(request.getContent());
        comment.setEdited(true);
        return commentMapper.toCommentResponse(comment);
    }

    @Transactional
    public void deleteComment(Long currentUserId, Long postId, Long commentId) {
        Profile profile = getCurrentProfile(currentUserId);
        Comment comment = getComment(postId, commentId);
        validateCommentAuthor(comment, profile);
        commentRepository.delete(comment);
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new CustomException("Post not found", HttpStatus.NOT_FOUND));
    }

    private Comment getComment(Long postId, Long commentId) {
        return commentRepository.findByIdAndPost_Id(commentId, postId)
                .orElseThrow(() -> new CustomException("Comment not found", HttpStatus.NOT_FOUND));
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

    private void validateCommentAuthor(Comment comment, Profile currentProfile) {
        if (comment.getAuthor() == null || !comment.getAuthor().getId().equals(currentProfile.getId())) {
            throw new CustomException("You are not allowed to modify this comment", HttpStatus.FORBIDDEN);
        }
    }

}
