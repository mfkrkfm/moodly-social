package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.UpdateProfileRequest;
import com.example.moodly_social_api.dto.UserResponse;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getProfile(String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        return toUserResponse(user);
    }

    public UserResponse updateProfile(String currentUsername, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        String requestedUsername = request.getUsername();
        String requestedEmail = request.getEmail();

        if (!user.getUsername().equals(requestedUsername)
                && userRepository.existsByUsername(requestedUsername)) {
            throw new CustomException("Username already taken", HttpStatus.CONFLICT);
        }

        if (userRepository.existsByEmailAndIdNot(requestedEmail, user.getId())) {
            throw new CustomException("Email already used by other user", HttpStatus.CONFLICT);
        }

        user.setUsername(requestedUsername);
        user.setEmail(requestedEmail);

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User savedUser = userRepository.save(user);
        return toUserResponse(savedUser);
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setAppUserRoles(user.getAppUserRoles());
        return response;
    }
}
