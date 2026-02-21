package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.user.UpdateUserRequest;
import com.example.moodly_social_api.dto.user.UserResponse;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getUser(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long currentUserId, UpdateUserRequest request) {
        User user = userRepository.findById(currentUserId)
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

        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setProfileId(user.getProfile() != null ? user.getProfile().getId() : null);
        response.setAppUserRoles(user.getAppUserRoles());
        return response;
    }
}
