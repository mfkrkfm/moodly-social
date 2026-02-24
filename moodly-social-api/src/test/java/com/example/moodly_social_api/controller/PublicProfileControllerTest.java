package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicProfileResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicUserCardResponse;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PublicProfileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PublicProfileService publicProfileService;

    @InjectMocks
    private PublicProfileController publicProfileController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(publicProfileController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    /// Test: Getting public profile of a user.
    void getPublicProfile_shouldReturnPublicProfile() throws Exception {
        String username = "testuser";
        PublicProfileResponse response = new PublicProfileResponse();
        response.setUsername(username);
        response.setBio("Test bio");
        response.setFollowersCount(100);
        response.setFollowingCount(50);

        when(publicProfileService.getPublicProfile(username)).thenReturn(response);

        mockMvc.perform(get("/{username}", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.bio").value("Test bio"))
                .andExpect(jsonPath("$.followersCount").value(100))
                .andExpect(jsonPath("$.followingCount").value(50));

        verify(publicProfileService, times(1)).getPublicProfile(username);
    }

    @Test
    /// Test: Getting public profile of a user that does not exist.
    void getPublicProfile_withNonExistingUser_shouldReturnNotFound() throws Exception {
        String username = "nonexistent";

        when(publicProfileService.getPublicProfile(username))
                .thenThrow(new CustomException("User not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/{username}", username))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Getting posts of a user.
    void getUserPosts_shouldReturnListOfPosts() throws Exception {
        String username = "testuser";
        PostResponse post1 = new PostResponse();
        post1.setId(1L);
        post1.setContent("Post 1");

        PostResponse post2 = new PostResponse();
        post2.setId(2L);
        post2.setContent("Post 2");

        List<PostResponse> posts = Arrays.asList(post1, post2);

        when(publicProfileService.getUserPosts(username)).thenReturn(posts);

        mockMvc.perform(get("/{username}/posts", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));

        verify(publicProfileService, times(1)).getUserPosts(username);
    }

    @Test
    /// Test: Getting posts of a user that has no posts.
    void getUserPosts_withNoPosts_shouldReturnEmptyList() throws Exception {
        String username = "testuser";

        when(publicProfileService.getUserPosts(username)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/{username}/posts", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    /// Test: Getting posts of a user that does not exist.
    void getUserPosts_withNonExistingUser_shouldReturnNotFound() throws Exception {
        String username = "nonexistent";

        when(publicProfileService.getUserPosts(username))
                .thenThrow(new CustomException("User not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/{username}/posts", username))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Getting a specific post of a user.
    void getUserPostById_shouldReturnPost() throws Exception {
        String username = "testuser";
        Long postId = 1L;
        PostResponse response = new PostResponse();
        response.setId(postId);
        response.setContent("Test post");

        when(publicProfileService.getUserPostById(username, postId)).thenReturn(response);

        mockMvc.perform(get("/{username}/posts/{postId}", username, postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(postId))
                .andExpect(jsonPath("$.content").value("Test post"));

        verify(publicProfileService, times(1)).getUserPostById(username, postId);
    }

    @Test
    /// Test: Getting a specific post of a user that does not exist.
    void getUserPostById_withNonExistingPost_shouldReturnNotFound() throws Exception {
        String username = "testuser";
        Long postId = 999L;

        when(publicProfileService.getUserPostById(username, postId))
                .thenThrow(new CustomException("Post not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/{username}/posts/{postId}", username, postId))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Getting a specific post of a user that belongs to a different user.
    void getUserPostById_withPostFromDifferentUser_shouldReturnNotFound() throws Exception {
        String username = "testuser";
        Long postId = 1L;

        when(publicProfileService.getUserPostById(username, postId))
                .thenThrow(new CustomException("Post not found for this user", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/{username}/posts/{postId}", username, postId))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Getting followers of a user.
    void getFollowers_shouldReturnListOfFollowers() throws Exception {
        String username = "testuser";
        PublicUserCardResponse follower1 = new PublicUserCardResponse();
        follower1.setUsername("follower1");

        PublicUserCardResponse follower2 = new PublicUserCardResponse();
        follower2.setUsername("follower2");

        List<PublicUserCardResponse> followers = Arrays.asList(follower1, follower2);

        when(publicProfileService.getFollowers(username)).thenReturn(followers);

        mockMvc.perform(get("/{username}/followers", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].username").value("follower1"))
                .andExpect(jsonPath("$[1].username").value("follower2"));

        verify(publicProfileService, times(1)).getFollowers(username);
    }

    @Test
    /// Test: Getting followers of a user that has no followers.
    void getFollowers_withNoFollowers_shouldReturnEmptyList() throws Exception {
        String username = "testuser";

        when(publicProfileService.getFollowers(username)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/{username}/followers", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    /// Test: Getting followers of a user that does not exist.
    void getFollowers_withNonExistingUser_shouldReturnNotFound() throws Exception {
        String username = "nonexistent";

        when(publicProfileService.getFollowers(username))
                .thenThrow(new CustomException("User not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/{username}/followers", username))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Getting following of a user.
    void getFollowing_shouldReturnListOfFollowing() throws Exception {
        String username = "testuser";
        PublicUserCardResponse following1 = new PublicUserCardResponse();
        following1.setUsername("following1");

        PublicUserCardResponse following2 = new PublicUserCardResponse();
        following2.setUsername("following2");

        List<PublicUserCardResponse> following = Arrays.asList(following1, following2);

        when(publicProfileService.getFollowing(username)).thenReturn(following);

        mockMvc.perform(get("/{username}/following", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].username").value("following1"))
                .andExpect(jsonPath("$[1].username").value("following2"));

        verify(publicProfileService, times(1)).getFollowing(username);
    }

    @Test
    /// Test: Getting following of a user that has no following.
    void getFollowing_withNoFollowing_shouldReturnEmptyList() throws Exception {
        String username = "testuser";

        when(publicProfileService.getFollowing(username)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/{username}/following", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }


    @Test
    /// Test: Getting following of a user that does not exist.
    void getFollowing_withNonExistingUser_shouldReturnNotFound() throws Exception {
        String username = "nonexistent";

        when(publicProfileService.getFollowing(username))
                .thenThrow(new CustomException("User not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/{username}/following", username))
                .andExpect(status().isNotFound());
    }
}

