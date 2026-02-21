package com.example.moodly_social_api.service.mapper;

import com.example.moodly_social_api.dto.post.PictureResponse;
import com.example.moodly_social_api.entity.Profile;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

    public PictureResponse toProfilePictureResponse(Profile profile) {
        if (profile == null || profile.getProfilePicture() == null || profile.getProfilePicture().getId() == null) {
            return null;
        }
        PictureResponse response = new PictureResponse();
        response.setId(profile.getProfilePicture().getId());
        response.setUrl("/media/" + profile.getProfilePicture().getId());
        return response;
    }

}
