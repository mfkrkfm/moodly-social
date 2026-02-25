package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.post.LikeResponse;
import com.example.moodly_social_api.dto.post.PostRequest;
import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.entity.Mood;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.exception.GlobalExceptionHandler;
import com.example.moodly_social_api.service.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PostControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PostService postService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PostController postController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(postController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    /// Test: Creating a post without files returns the created post.
    void createPost_shouldReturnCreatedPost() throws Exception {
        Long userId = 1L;
        PostRequest request = new PostRequest();
        request.setMood(Mood.HAPPY);
        request.setContent("Test post content");

        PostResponse response = new PostResponse();
        response.setId(1L);
        response.setMood(Mood.HAPPY);
        response.setContent("Test post content");

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.createPost(eq(userId), any(PostRequest.class), isNull()))
                .thenReturn(response);

        mockMvc.perform(multipart("/posts")
                        .file(new MockMultipartFile("post", "", "application/json",
                                objectMapper.writeValueAsBytes(request)))
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.mood").value("HAPPY"))
                .andExpect(jsonPath("$.content").value("Test post content"));

        verify(postService, times(1)).createPost(eq(userId), any(PostRequest.class), isNull());
    }

    @Test
    /// Test: Creating a post with files returns the created post with the files.
    void createPost_withFiles_shouldReturnCreatedPost() throws Exception {
        Long userId = 1L;
        PostRequest request = new PostRequest();
        request.setMood(Mood.SAD);
        request.setContent("Post with images");

        PostResponse response = new PostResponse();
        response.setId(2L);
        response.setMood(Mood.SAD);
        response.setContent("Post with images");

        MockMultipartFile file1 = new MockMultipartFile("files", "image1.jpg", "image/jpeg", "image data".getBytes());
        MockMultipartFile file2 = new MockMultipartFile("files", "image2.jpg", "image/jpeg", "image data 2".getBytes());

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.createPost(eq(userId), any(PostRequest.class), anyList()))
                .thenReturn(response);

        mockMvc.perform(multipart("/posts")
                        .file(new MockMultipartFile("post", "", "application/json",
                                objectMapper.writeValueAsBytes(request)))
                        .file(file1)
                        .file(file2)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2));

        verify(postService, times(1)).createPost(eq(userId), any(PostRequest.class), anyList());
    }

    @Test
    /// Test: Getting the feed returns a list of posts for the authenticated user.
    void getFeed_shouldReturnListOfPosts() throws Exception {
        Long userId = 1L;
        PostResponse post1 = new PostResponse();
        post1.setId(1L);
        post1.setContent("Post 1");

        PostResponse post2 = new PostResponse();
        post2.setId(2L);
        post2.setContent("Post 2");

        List<PostResponse> feed = Arrays.asList(post1, post2);

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.getFeed(userId)).thenReturn(feed);

        mockMvc.perform(get("/posts")
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));

        verify(postService, times(1)).getFeed(userId);
    }

    @Test
    /// Test: Getting the feed when there are no posts returns an empty list.
    void getFeed_withEmptyFeed_shouldReturnEmptyList() throws Exception {
        Long userId = 1L;

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.getFeed(userId)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/posts")
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    /// Test: Getting a post by ID returns the post if it exists and belongs to the user.
    void getPostById_shouldReturnPost() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        PostResponse response = new PostResponse();
        response.setId(postId);
        response.setContent("Test post");

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.getPostById(postId, userId)).thenReturn(response);

        mockMvc.perform(get("/posts/{postId}", postId)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(postId))
                .andExpect(jsonPath("$.content").value("Test post"));

        verify(postService, times(1)).getPostById(postId, userId);
    }

    @Test
    /// Test: Getting a post by ID that does not exist returns a 404 Not Found status.
    void getPostById_withNonExistingPost_shouldReturnNotFound() throws Exception {
        Long userId = 1L;
        Long postId = 999L;

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.getPostById(postId, userId))
                .thenThrow(new CustomException("Post not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/posts/{postId}", postId)
                        .principal(authentication))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Updating a post returns the updated post if the user is authorized.
    void updatePost_shouldReturnUpdatedPost() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        PostRequest request = new PostRequest();
        request.setMood(Mood.CALM);
        request.setContent("Updated content");

        PostResponse response = new PostResponse();
        response.setId(postId);
        response.setMood(Mood.CALM);
        response.setContent("Updated content");

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.updatePost(userId, postId, request)).thenReturn(response);

        mockMvc.perform(put("/posts/{postId}", postId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(postId))
                .andExpect(jsonPath("$.content").value("Updated content"));

        verify(postService, times(1)).updatePost(userId, postId, request);
    }

    @Test
    /// Test: Updating a post with an unauthorized user returns a 403 Forbidden status.
    void updatePost_withUnauthorizedUser_shouldReturnForbidden() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        PostRequest request = new PostRequest();
        request.setMood(Mood.ANGRY);
        request.setContent("Updated content");

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.updatePost(userId, postId, request))
                .thenThrow(new CustomException("Unauthorized", HttpStatus.FORBIDDEN));

        mockMvc.perform(put("/posts/{postId}", postId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    /// Test: Deleting a post returns an OK status if the user is authorized.
    void deletePost_shouldReturnOk() throws Exception {
        Long userId = 1L;
        Long postId = 1L;

        when(authentication.getName()).thenReturn(userId.toString());
        doNothing().when(postService).deletePost(userId, postId);

        mockMvc.perform(delete("/posts/{postId}", postId)
                        .principal(authentication))
                .andExpect(status().isOk());

        verify(postService, times(1)).deletePost(userId, postId);
    }

    @Test
    /// Test: Deleting a post with an unauthorized user returns a 403 Forbidden status.
    void deletePost_withUnauthorizedUser_shouldReturnForbidden() throws Exception {
        Long userId = 1L;
        Long postId = 1L;

        when(authentication.getName()).thenReturn(userId.toString());
        doThrow(new CustomException("Unauthorized", HttpStatus.FORBIDDEN))
                .when(postService).deletePost(userId, postId);

        mockMvc.perform(delete("/posts/{postId}", postId)
                        .principal(authentication))
                .andExpect(status().isForbidden());
    }

    @Test
    void likePost_shouldReturnLikeResponse() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        LikeResponse response = new LikeResponse();
        response.setLiked(true);
        response.setLikesCount(5);

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.likePost(userId, postId)).thenReturn(response);

        mockMvc.perform(post("/posts/{postId}/likes", postId)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likesCount").value(5));

        verify(postService, times(1)).likePost(userId, postId);
    }

    @Test
    /// Test: Liking a post that has already been liked by the user returns a 409 Conflict status.
    void likePost_alreadyLiked_shouldReturnConflict() throws Exception {
        Long userId = 1L;
        Long postId = 1L;

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.likePost(userId, postId))
                .thenThrow(new CustomException("Already liked", HttpStatus.CONFLICT));

        mockMvc.perform(post("/posts/{postId}/likes", postId)
                        .principal(authentication))
                .andExpect(status().isConflict());
    }

    @Test
    /// Test: Unliking a post that has not been liked by the user returns a 409 Conflict status.
    void unlikePost_shouldReturnLikeResponse() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        LikeResponse response = new LikeResponse();
        response.setLiked(false);
        response.setLikesCount(4);

        when(authentication.getName()).thenReturn(userId.toString());
        when(postService.unlikePost(userId, postId)).thenReturn(response);

        mockMvc.perform(delete("/posts/{postId}/likes", postId)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(false))
                .andExpect(jsonPath("$.likesCount").value(4));

        verify(postService, times(1)).unlikePost(userId, postId);
    }

    @Test
    /// Test: Getting likes for a post returns a list of profiles who liked the post.
    void getPostLikes_shouldReturnListOfProfiles() throws Exception {
        Long postId = 1L;
        ProfileResponse profile1 = new ProfileResponse();
        profile1.setUsername("user1");

        ProfileResponse profile2 = new ProfileResponse();
        profile2.setUsername("user2");

        List<ProfileResponse> likes = Arrays.asList(profile1, profile2);

        when(postService.getPostLikes(postId)).thenReturn(likes);

        mockMvc.perform(get("/posts/{postId}/likes", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].username").value("user1"))
                .andExpect(jsonPath("$[1].username").value("user2"));

        verify(postService, times(1)).getPostLikes(postId);
    }

    @Test
    /// Test: Getting likes for a post with no likes returns an empty list.
    void getPostLikes_withNoLikes_shouldReturnEmptyList() throws Exception {
        Long postId = 1L;

        when(postService.getPostLikes(postId)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/posts/{postId}/likes", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}






