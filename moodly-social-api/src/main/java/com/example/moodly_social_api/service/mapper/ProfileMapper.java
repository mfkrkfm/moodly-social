package com.example.moodly_social_api.service.mapper;

import com.example.moodly_social_api.dto.post.PictureResponse;
import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.entity.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
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

    public ProfileResponse toProfileResponse(Profile profile) {
        ProfileResponse response = new ProfileResponse();
        response.setUsername(profile.getUser() != null ? profile.getUser().getUsername() : null);
        response.setAuthorPicture(toProfilePictureResponse(profile));
        response.setFirstName(profile.getFirstName());
        response.setLastName(profile.getLastName());
        response.setBio(profile.getBio());
        response.setBirthDate(profile.getBirthDate());
        response.setMood(profile.getMood());
        return response;
    }

    public List<ProfileResponse> toProfileResponses(Iterable<Profile> profiles) {
        if (profiles == null) {
            return Collections.emptyList();
        }

        List<ProfileResponse> responses = new ArrayList<>();
        for (Profile profile : profiles) {
            responses.add(toProfileResponse(profile));
        }
        return responses;
    }

}
