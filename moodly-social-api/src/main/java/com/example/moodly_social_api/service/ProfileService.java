package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.ProfileResponse;
import com.example.moodly_social_api.dto.UpdateProfileRequest;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService  {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }

        return toProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(String currentUsername, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setBio(request.getBio());
        profile.setBirthDate(request.getBirthDate());
        profile.setMood(request.getMood());

        return toProfileResponse(profile);
    }

    private ProfileResponse toProfileResponse(Profile profile) {
        ProfileResponse response = new ProfileResponse();
        response.setFirstName(profile.getFirstName());
        response.setLastName(profile.getLastName());
        response.setBio(profile.getBio());
        response.setBirthDate(profile.getBirthDate());
        response.setMood(profile.getMood());
        return response;
    }
}
