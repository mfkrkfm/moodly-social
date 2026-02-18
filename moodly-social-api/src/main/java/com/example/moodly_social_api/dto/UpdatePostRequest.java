package com.example.moodly_social_api.dto;

import com.example.moodly_social_api.entity.Mood;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePostRequest {

    @Size(max = 2000)
    private String content;

    private Mood mood;
}
