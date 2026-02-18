package com.example.moodly_social_api.dto.post;

import com.example.moodly_social_api.entity.Mood;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequest {

    @NotBlank
    @Size(max = 2000)
    private String content;

    @NotNull
    private Mood mood;

}
