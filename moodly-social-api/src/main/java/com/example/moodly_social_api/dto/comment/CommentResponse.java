package com.example.moodly_social_api.dto.comment;

import com.example.moodly_social_api.dto.post.PictureResponse;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {

    private Long id;
    private String content;
    private String authorUsername;
    private PictureResponse authorPicture;
    private LocalDateTime createdAt;
    private boolean isEdited;
}
