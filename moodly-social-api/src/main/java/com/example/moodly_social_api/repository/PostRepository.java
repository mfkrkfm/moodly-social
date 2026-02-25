package com.example.moodly_social_api.repository;

import com.example.moodly_social_api.entity.Post;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findAllByAuthor_User_UsernameOrderByCreatedAtDesc(String username);

    Optional<Post> findByIdAndAuthor_User_Username(Long id, String username);

    long countByAuthor_IdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            Long authorId,
            LocalDateTime startOfDay,
            LocalDateTime nextDayStart
    );
}
