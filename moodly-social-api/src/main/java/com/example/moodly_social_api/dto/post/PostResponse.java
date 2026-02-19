package com.example.moodly_social_api.dto.post;

import com.example.moodly_social_api.entity.Mood;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostResponse {

    private Long id;
    private String content;
    private boolean isEdited;
    private Mood mood;
    private LocalDateTime createdAt;

    private int likesCount;
    private int commentsCount;
    private List<PictureResponse> pictures;

    private boolean likedByMe;
}
