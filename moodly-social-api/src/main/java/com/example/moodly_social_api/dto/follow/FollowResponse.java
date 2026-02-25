package com.example.moodly_social_api.dto.follow;

import lombok.Data;

@Data
public class FollowResponse {
    private String targetUsername;
    private boolean following;
    private int followersCount;
}
