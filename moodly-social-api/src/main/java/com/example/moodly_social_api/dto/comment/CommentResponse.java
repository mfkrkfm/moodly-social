package com.example.moodly_social_api.dto.comment;

import com.example.moodly_social_api.dto.post.PictureResponse;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CommentResponse {

    private Long id;
    private Long postId;
    private Long parentCommentId;
    private String content;
    private String authorUsername;
    private PictureResponse authorPicture;
    private LocalDateTime createdAt;
    private boolean isEdited;
    private List<CommentResponse> replies = new ArrayList<>();
}
