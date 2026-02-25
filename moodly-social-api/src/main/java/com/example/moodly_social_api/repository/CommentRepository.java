package com.example.moodly_social_api.repository;

import com.example.moodly_social_api.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findAllByPost_IdOrderByCreatedAtAsc(Long postId);

    Optional<Comment> findByIdAndPost_Id(Long commentId, Long postId);
}
