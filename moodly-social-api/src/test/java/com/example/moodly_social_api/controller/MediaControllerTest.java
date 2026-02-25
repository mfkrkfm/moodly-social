package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.exception.GlobalExceptionHandler;
import com.example.moodly_social_api.service.MediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class MediaControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MediaService mediaService;

    @InjectMocks
    private MediaController mediaController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(mediaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    /// Test: Retrieving media content by media ID.
    void getMedia_shouldReturnMediaContent() throws Exception {
        Long mediaId = 1L;
        byte[] content = "image data".getBytes();

        when(mediaService.getMediaContent(mediaId)).thenReturn(content);

        mockMvc.perform(get("/media/{id}", mediaId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM))
                .andExpect(content().bytes(content));

        verify(mediaService, times(1)).getMediaContent(mediaId);
    }

    @Test
    /// Test: Attempting to retrieve media that does not exist.
    void getMedia_withNonExistingMedia_shouldReturnNotFound() throws Exception {
        Long mediaId = 999L;

        when(mediaService.getMediaContent(mediaId))
                .thenThrow(new CustomException("Media not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/media/{id}", mediaId))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Attempting to retrieve media that has been deleted.
    void getMedia_withDeletedMedia_shouldReturnNotFound() throws Exception {
        Long mediaId = 1L;

        when(mediaService.getMediaContent(mediaId))
                .thenThrow(new CustomException("Media has been deleted", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/media/{id}", mediaId))
                .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Retrieving media content for a media file that is larger than the typical size.
    void getMedia_withLargeFile_shouldReturnMediaContent() throws Exception {
        Long mediaId = 1L;
        byte[] largeContent = new byte[1024 * 1024]; // 1MB
        for (int i = 0; i < largeContent.length; i++) {
            largeContent[i] = (byte) (i % 256);
        }

        when(mediaService.getMediaContent(mediaId)).thenReturn(largeContent);

        mockMvc.perform(get("/media/{id}", mediaId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM))
                .andExpect(content().bytes(largeContent));
    }

    @Test
    /// Test: Retrieving media content for a media file that has no content (e.g., an empty file).
    void getMedia_withEmptyContent_shouldReturnEmptyResponse() throws Exception {
        Long mediaId = 1L;
        byte[] emptyContent = new byte[0];

        when(mediaService.getMediaContent(mediaId)).thenReturn(emptyContent);

        mockMvc.perform(get("/media/{id}", mediaId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM))
                .andExpect(content().bytes(emptyContent));
    }

    @Test
    /// Test: Attempting to retrieve media with an invalid media ID.
    void getMedia_withInvalidMediaId_shouldReturnBadRequest() throws Exception {
        Long mediaId = -1L;

        when(mediaService.getMediaContent(mediaId))
                .thenThrow(new CustomException("Invalid media ID", HttpStatus.BAD_REQUEST));

        mockMvc.perform(get("/media/{id}", mediaId))
                .andExpect(status().isBadRequest());
    }

    @Test
    /// Test: Attempting to retrieve media when the service layer throws an unexpected exception.
    void getMedia_withServiceError_shouldReturnInternalServerError() throws Exception {
        Long mediaId = 1L;

        when(mediaService.getMediaContent(mediaId))
                .thenThrow(new CustomException("Service error", HttpStatus.INTERNAL_SERVER_ERROR));

        mockMvc.perform(get("/media/{id}", mediaId))
                .andExpect(status().isInternalServerError());
    }
}

