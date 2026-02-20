package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.post.PictureResponse;
import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.dto.profile.UpdateProfileRequest;
import com.example.moodly_social_api.entity.Picture;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ProfileService  {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfileById(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }
        return toProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }
        return toProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(Long currentUserId, UpdateProfileRequest request) {
        Profile profile = getCurrentProfile(currentUserId);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setBio(request.getBio());
        profile.setBirthDate(request.getBirthDate());
        profile.setMood(request.getMood());

        return toProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfilePicture(Long currentUserId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException("Profile picture file is required", HttpStatus.BAD_REQUEST);
        }

        Profile profile = getCurrentProfile(currentUserId);
        Picture picture = profile.getProfilePicture();
        if (picture == null) {
            picture = new Picture();
            profile.setProfilePicture(picture);
        }

        try {
            picture.setContent(file.getBytes());
        } catch (IOException e) {
            throw new CustomException("Failed to read uploaded file", HttpStatus.BAD_REQUEST);
        }

        userRepository.flush();
        return toProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse deleteProfilePicture(Long currentUserId) {
        Profile profile = getCurrentProfile(currentUserId);
        profile.setProfilePicture(null);
        userRepository.flush();
        return toProfileResponse(profile);
    }

    private Profile getCurrentProfile(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }
        return profile;
    }

    private ProfileResponse toProfileResponse(Profile profile) {
        ProfileResponse response = new ProfileResponse();
        response.setUsername(profile.getUser() != null ? profile.getUser().getUsername() : null);
        response.setAuthorPicture(toAvatar(profile));
        response.setFirstName(profile.getFirstName());
        response.setLastName(profile.getLastName());
        response.setBio(profile.getBio());
        response.setBirthDate(profile.getBirthDate());
        response.setMood(profile.getMood());
        return response;
    }

    private PictureResponse toAvatar(Profile profile) {
        if (profile == null || profile.getProfilePicture() == null || profile.getProfilePicture().getId() == null) {
            return null;
        }
        PictureResponse response = new PictureResponse();
        response.setId(profile.getProfilePicture().getId());
        response.setUrl("/media/" + profile.getProfilePicture().getId());
        return response;
    }
}
