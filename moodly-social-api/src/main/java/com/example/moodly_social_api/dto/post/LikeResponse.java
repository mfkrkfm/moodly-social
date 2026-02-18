package com.example.moodly_social_api.dto.post;

import lombok.Data;

@Data
public class LikeResponse {
    private Long postId;
    private boolean liked;
    private int likesCount;
}
