package com.example.moodly_social_api.dto.publicprofile;

import com.example.moodly_social_api.dto.post.PictureResponse;
import com.example.moodly_social_api.entity.Mood;
import lombok.Data;

@Data
public class PublicProfileResponse {
    private String username;
    private PictureResponse authorPicture;
    private String firstName;
    private String lastName;
    private String bio;
    private Mood mood;
    private int followersCount;
    private int followingCount;
}
