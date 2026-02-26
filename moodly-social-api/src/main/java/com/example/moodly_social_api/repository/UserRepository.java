package com.example.moodly_social_api.repository;

import com.example.moodly_social_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long currentUserId);

    List<User> findTop20ByUsernameContainingIgnoreCase(String query);

    @Transactional
    void deleteByUsername(String username);
}
