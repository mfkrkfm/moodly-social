package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.dto.profile.UpdateProfileRequest;
import com.example.moodly_social_api.entity.Picture;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import com.example.moodly_social_api.service.mapper.ProfileMapper;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;

    @Transactional(readOnly = true)
    public ProfileResponse getProfileById(Long currentUserId) {
        User user = userRepository
            .findById(currentUserId)
            .orElseThrow(() ->
                new CustomException("User not found", HttpStatus.NOT_FOUND)
            );
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException(
                "Profile not found",
                HttpStatus.NOT_FOUND
            );
        }
        return profileMapper.toProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileByUsername(String username) {
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() ->
                new CustomException("User not found", HttpStatus.NOT_FOUND)
            );
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException(
                "Profile not found",
                HttpStatus.NOT_FOUND
            );
        }
        return profileMapper.toProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(
        Long currentUserId,
        UpdateProfileRequest request
    ) {
        Profile profile = getCurrentProfile(currentUserId);
        profile.setFirstName(normalizeOptionalText(request.getFirstName()));
        profile.setLastName(normalizeOptionalText(request.getLastName()));
        profile.setBio(request.getBio());
        profile.setBirthDate(request.getBirthDate());
        profile.setMood(request.getMood());

        return profileMapper.toProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfilePicture(
        Long currentUserId,
        MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(
                "Profile picture file is required",
                HttpStatus.BAD_REQUEST
            );
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
            throw new CustomException(
                "Failed to read uploaded file",
                HttpStatus.BAD_REQUEST
            );
        }

        userRepository.flush();
        return profileMapper.toProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse deleteProfilePicture(Long currentUserId) {
        Profile profile = getCurrentProfile(currentUserId);
        profile.setProfilePicture(null);
        userRepository.flush();
        return profileMapper.toProfileResponse(profile);
    }

    private Profile getCurrentProfile(Long currentUserId) {
        User user = userRepository
            .findById(currentUserId)
            .orElseThrow(() ->
                new CustomException("User not found", HttpStatus.NOT_FOUND)
            );
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException(
                "Profile not found",
                HttpStatus.NOT_FOUND
            );
        }
        return profile;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
