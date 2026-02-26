package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.follow.FollowResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.exception.GlobalExceptionHandler;
import com.example.moodly_social_api.service.PublicProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FollowControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PublicProfileService publicProfileService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private FollowController followController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(followController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    /// Test: Following another user successfully.
    void follow_shouldReturnFollowResponse() throws Exception {
        Long userId = 1L;
        String targetUsername = "targetuser";
        FollowResponse response = new FollowResponse();
        response.setFollowing(true);
        response.setFollowersCount(10);

        when(authentication.getName()).thenReturn(userId.toString());
        when(publicProfileService.follow(userId, targetUsername)).thenReturn(response);

        mockMvc.perform(post("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.following").value(true))
                .andExpect(jsonPath("$.followersCount").value(10));

        verify(publicProfileService, times(1)).follow(userId, targetUsername);
    }

    @Test
    /// Test: Attempting to follow a non-existing user should return a 404 Not Found status.
    void follow_withNonExistingUser_shouldReturnNotFound() throws Exception {
        Long userId = 1L;
        String targetUsername = "nonexistent";

        when(authentication.getName()).thenReturn(userId.toString());
        when(publicProfileService.follow(userId, targetUsername))
                .thenThrow(new CustomException("User not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(post("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Attempting to follow a user that is already being followed should return a 409 Conflict status.
    void follow_alreadyFollowing_shouldReturnConflict() throws Exception {
        Long userId = 1L;
        String targetUsername = "targetuser";

        when(authentication.getName()).thenReturn(userId.toString());
        when(publicProfileService.follow(userId, targetUsername))
                .thenThrow(new CustomException("Already following", HttpStatus.CONFLICT));

        mockMvc.perform(post("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isConflict());
    }

    @Test
    /// Test: Attempting to follow oneself should return a 400 Bad Request status.
    void follow_selfFollow_shouldReturnBadRequest() throws Exception {
        Long userId = 1L;
        String targetUsername = "myusername";

        when(authentication.getName()).thenReturn(userId.toString());
        when(publicProfileService.follow(userId, targetUsername))
                .thenThrow(new CustomException("Cannot follow yourself", HttpStatus.BAD_REQUEST));

        mockMvc.perform(post("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isBadRequest());
    }

    @Test
    /// Test: Attempting to follow with an invalid authentication token should return a 401 Unauthorized status.
    void follow_withInvalidToken_shouldThrowException() throws Exception {
        String targetUsername = "targetuser";

        when(authentication.getName()).thenReturn("invalid");

        mockMvc.perform(post("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isUnauthorized());
    }

    @Test
    /// Test: Unfollowing a user successfully.
    void unfollow_shouldReturnFollowResponse() throws Exception {
        Long userId = 1L;
        String targetUsername = "targetuser";
        FollowResponse response = new FollowResponse();
        response.setFollowing(false);
        response.setFollowersCount(9);

        when(authentication.getName()).thenReturn(userId.toString());
        when(publicProfileService.unfollow(userId, targetUsername)).thenReturn(response);

        mockMvc.perform(delete("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.following").value(false))
                .andExpect(jsonPath("$.followersCount").value(9));

        verify(publicProfileService, times(1)).unfollow(userId, targetUsername);
    }

    @Test
    /// Test: Attempting to unfollow a non-existing user should return a 404 Not Found status.
    void unfollow_withNonExistingUser_shouldReturnNotFound() throws Exception {
        Long userId = 1L;
        String targetUsername = "nonexistent";

        when(authentication.getName()).thenReturn(userId.toString());
        when(publicProfileService.unfollow(userId, targetUsername))
                .thenThrow(new CustomException("User not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(delete("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Attempting to unfollow a user that is not currently being followed should return a 409 Conflict status.
    void unfollow_notFollowing_shouldReturnConflict() throws Exception {
        Long userId = 1L;
        String targetUsername = "targetuser";

        when(authentication.getName()).thenReturn(userId.toString());
        when(publicProfileService.unfollow(userId, targetUsername))
                .thenThrow(new CustomException("Not following", HttpStatus.CONFLICT));

        mockMvc.perform(delete("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isConflict());
    }

    @Test
    /// Test: Attempting to unfollow with an invalid authentication token should return a 401 Unauthorized status.
    void unfollow_withInvalidToken_shouldThrowException() throws Exception {
        String targetUsername = "targetuser";

        when(authentication.getName()).thenReturn("invalid");

        mockMvc.perform(delete("/users/{username}/followers", targetUsername)
                        .principal(authentication))
                .andExpect(status().isUnauthorized());
    }
}

