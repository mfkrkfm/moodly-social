package com.example.moodly_social_api.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCommentRequest {

    @NotBlank
    @Size(max = 1000)
    private String content;
}
