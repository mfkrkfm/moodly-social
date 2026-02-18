package com.example.moodly_social_api.dto.comment;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {

    private Long id;
    private String content;
    private String authorUsername;
    private LocalDateTime createdAt;
}
