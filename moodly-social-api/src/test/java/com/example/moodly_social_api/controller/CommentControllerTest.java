package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.comment.CommentRequest;
import com.example.moodly_social_api.dto.comment.CommentResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.exception.GlobalExceptionHandler;
import com.example.moodly_social_api.service.CommentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
class CommentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CommentService commentService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CommentController commentController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(commentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void createComment_shouldReturnCreatedComment() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        CommentRequest request = new CommentRequest();
        request.setContent("Test comment");

        CommentResponse response = new CommentResponse();
        response.setId(1L);
        response.setContent("Test comment");
        response.setPostId(postId);

        when(authentication.getName()).thenReturn(userId.toString());
        when(commentService.postComment(userId, postId, request)).thenReturn(response);

        mockMvc.perform(post("/posts/{postId}/comments", postId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.content").value("Test comment"))
                .andExpect(jsonPath("$.postId").value(postId));

        verify(commentService, times(1)).postComment(userId, postId, request);
    }

    @Test
    void createComment_withEmptyContent_shouldReturnBadRequest() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        CommentRequest request = new CommentRequest();

        when(authentication.getName()).thenReturn(userId.toString());

        mockMvc.perform(post("/posts/{postId}/comments", postId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(commentService, never()).postComment(any(), any(), any());
    }

    @Test
    void createComment_withNonExistingPost_shouldReturnNotFound() throws Exception {
        Long userId = 1L;
        Long postId = 999L;
        CommentRequest request = new CommentRequest();
        request.setContent("Test comment");

        when(authentication.getName()).thenReturn(userId.toString());
        when(commentService.postComment(userId, postId, request))
                .thenThrow(new CustomException("Post not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(post("/posts/{postId}/comments", postId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void replyToComment_shouldReturnReply() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        Long commentId = 1L;
        CommentRequest request = new CommentRequest();
        request.setContent("Reply to comment");

        CommentResponse response = new CommentResponse();
        response.setId(2L);
        response.setContent("Reply to comment");
        response.setPostId(postId);
        response.setParentCommentId(commentId);

        when(authentication.getName()).thenReturn(userId.toString());
        when(commentService.replyToComment(userId, postId, commentId, request)).thenReturn(response);

        mockMvc.perform(post("/posts/{postId}/comments/{commentId}", postId, commentId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.content").value("Reply to comment"))
                .andExpect(jsonPath("$.parentCommentId").value(commentId));

        verify(commentService, times(1)).replyToComment(userId, postId, commentId, request);
    }

    @Test
    void replyToComment_withNonExistingComment_shouldReturnNotFound() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        Long commentId = 999L;
        CommentRequest request = new CommentRequest();
        request.setContent("Reply to comment");

        when(authentication.getName()).thenReturn(userId.toString());
        when(commentService.replyToComment(userId, postId, commentId, request))
                .thenThrow(new CustomException("Comment not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(post("/posts/{postId}/comments/{commentId}", postId, commentId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCommentsByPost_shouldReturnListOfComments() throws Exception {
        Long postId = 1L;
        CommentResponse comment1 = new CommentResponse();
        comment1.setId(1L);
        comment1.setContent("Comment 1");

        CommentResponse comment2 = new CommentResponse();
        comment2.setId(2L);
        comment2.setContent("Comment 2");

        List<CommentResponse> comments = Arrays.asList(comment1, comment2);

        when(commentService.getCommentsByPost(postId)).thenReturn(comments);

        mockMvc.perform(get("/posts/{postId}/comments", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));

        verify(commentService, times(1)).getCommentsByPost(postId);
    }

    @Test
    void getCommentsByPost_withNoComments_shouldReturnEmptyList() throws Exception {
        Long postId = 1L;

        when(commentService.getCommentsByPost(postId)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/posts/{postId}/comments", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getCommentsByPost_withNonExistingPost_shouldReturnNotFound() throws Exception {
        Long postId = 999L;

        when(commentService.getCommentsByPost(postId))
                .thenThrow(new CustomException("Post not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/posts/{postId}/comments", postId))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateComment_shouldReturnUpdatedComment() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        Long commentId = 1L;
        CommentRequest request = new CommentRequest();
        request.setContent("Updated comment");

        CommentResponse response = new CommentResponse();
        response.setId(commentId);
        response.setContent("Updated comment");

        when(authentication.getName()).thenReturn(userId.toString());
        when(commentService.updateComment(userId, postId, commentId, request)).thenReturn(response);

        mockMvc.perform(put("/posts/{postId}/comments/{commentId}", postId, commentId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(commentId))
                .andExpect(jsonPath("$.content").value("Updated comment"));

        verify(commentService, times(1)).updateComment(userId, postId, commentId, request);
    }

    @Test
    void updateComment_withUnauthorizedUser_shouldReturnForbidden() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        Long commentId = 1L;
        CommentRequest request = new CommentRequest();
        request.setContent("Updated comment");

        when(authentication.getName()).thenReturn(userId.toString());
        when(commentService.updateComment(userId, postId, commentId, request))
                .thenThrow(new CustomException("Unauthorized", HttpStatus.FORBIDDEN));

        mockMvc.perform(put("/posts/{postId}/comments/{commentId}", postId, commentId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteComment_shouldReturnNoContent() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        Long commentId = 1L;

        when(authentication.getName()).thenReturn(userId.toString());
        doNothing().when(commentService).deleteComment(userId, postId, commentId);

        mockMvc.perform(delete("/posts/{postId}/comments/{commentId}", postId, commentId)
                        .principal(authentication))
                .andExpect(status().isNoContent());

        verify(commentService, times(1)).deleteComment(userId, postId, commentId);
    }

    @Test
    void deleteComment_withUnauthorizedUser_shouldReturnForbidden() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        Long commentId = 1L;

        when(authentication.getName()).thenReturn(userId.toString());
        doThrow(new CustomException("Unauthorized", HttpStatus.FORBIDDEN))
                .when(commentService).deleteComment(userId, postId, commentId);

        mockMvc.perform(delete("/posts/{postId}/comments/{commentId}", postId, commentId)
                        .principal(authentication))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteComment_withNonExistingComment_shouldReturnNotFound() throws Exception {
        Long userId = 1L;
        Long postId = 1L;
        Long commentId = 999L;

        when(authentication.getName()).thenReturn(userId.toString());
        doThrow(new CustomException("Comment not found", HttpStatus.NOT_FOUND))
                .when(commentService).deleteComment(userId, postId, commentId);

        mockMvc.perform(delete("/posts/{postId}/comments/{commentId}", postId, commentId)
                        .principal(authentication))
                .andExpect(status().isNotFound());
    }
}

