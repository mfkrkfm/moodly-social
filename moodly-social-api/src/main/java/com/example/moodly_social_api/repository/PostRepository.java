package com.example.moodly_social_api.repository;

import com.example.moodly_social_api.entity.Post;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    @EntityGraph(attributePaths = {"author", "comments", "likedBy", "pictures"})
    List<Post> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"author", "comments", "likedBy", "pictures"})
    Optional<Post> findById(Long id);
}
