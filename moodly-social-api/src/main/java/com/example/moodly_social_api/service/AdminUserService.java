package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.admin.AdminUserResponse;
import com.example.moodly_social_api.dto.admin.UpdateUserRolesRequest;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.entity.UserRole;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository
            .findAll()
            .stream()
            .map(this::toAdminUserResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long userId) {
        User user = findUserOrThrow(userId);
        return toAdminUserResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUserRoles(
        Long userId,
        UpdateUserRolesRequest request
    ) {
        User user = findUserOrThrow(userId);
        List<UserRole> normalizedRoles = normalizeRoles(request.getRoles());
        user.setAppUserRoles(normalizedRoles);
        return toAdminUserResponse(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = findUserOrThrow(userId);
        userRepository.delete(user);
    }

    private User findUserOrThrow(Long userId) {
        return userRepository
            .findById(userId)
            .orElseThrow(() ->
                new CustomException("User not found", HttpStatus.NOT_FOUND)
            );
    }

    private static List<UserRole> normalizeRoles(List<UserRole> roles) {
        if (roles == null || roles.isEmpty()) {
            throw new CustomException(
                "Roles must not be empty",
                HttpStatus.BAD_REQUEST
            );
        }
        if (roles.stream().anyMatch(Objects::isNull)) {
            throw new CustomException(
                "Roles must not contain null values",
                HttpStatus.BAD_REQUEST
            );
        }

        Set<UserRole> uniqueRoles = new HashSet<>(roles);
        return new ArrayList<>(uniqueRoles);
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setProfileId(
            user.getProfile() != null ? user.getProfile().getId() : null
        );
        response.setRoles(user.getAppUserRoles());
        return response;
    }
}
