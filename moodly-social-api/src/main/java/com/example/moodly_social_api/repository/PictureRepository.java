package com.example.moodly_social_api.repository;

import com.example.moodly_social_api.entity.Picture;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PictureRepository extends JpaRepository<Picture, Long> {
}
