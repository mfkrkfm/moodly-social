package com.example.moodly_social_api.repository;

import com.example.moodly_social_api.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

}
