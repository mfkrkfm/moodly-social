package com.example.moodly_social_api.dto.post;
import com.example.moodly_social_api.entity.Mood;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostCardResponse {

    private Long id;
    private String authorUsername;
    private String authorAvatarUrl;
    private String content;
    private Mood mood;
    private LocalDateTime createdAt;
    private PictureResponse pictures;

    private int likesCount;
    private int commentsCount;
    private boolean likedByMe;
}
