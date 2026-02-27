package com.example.moodly_social_api.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.dto.profile.UpdateProfileRequest;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.exception.GlobalExceptionHandler;
import com.example.moodly_social_api.service.ProfileService;
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
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class ProfileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProfileService profileService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProfileController profileController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(profileController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    /// Test: Getting profile info with valid token returns profile data.
    void getMyProfileInfo_shouldReturnProfile() throws Exception {
        Long userId = 1L;
        ProfileResponse response = new ProfileResponse();
        response.setUsername("testuser");
        response.setBio("Test bio");

        when(authentication.getName()).thenReturn(userId.toString());
        when(profileService.getProfileById(userId)).thenReturn(response);

        mockMvc
            .perform(get("/profile").principal(authentication))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("testuser"))
            .andExpect(jsonPath("$.bio").value("Test bio"));

        verify(profileService, times(1)).getProfileById(userId);
    }

    @Test
    /// Test: Getting profile info with invalid token throws 401 error.
    void getMyProfileInfo_withInvalidToken_shouldThrowException()
        throws Exception {
        when(authentication.getName()).thenReturn("invalid");

        mockMvc
            .perform(get("/profile").principal(authentication))
            .andExpect(status().isUnauthorized());
    }

    @Test
    /// Test: Updating profile info with valid data returns updated profile.
    void updateMyProfileInfo_shouldReturnUpdatedProfile() throws Exception {
        Long userId = 1L;
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setBio("Updated bio");
        request.setFirstName("John");

        ProfileResponse response = new ProfileResponse();
        response.setUsername("testuser");
        response.setBio("Updated bio");
        response.setFirstName("John");

        when(authentication.getName()).thenReturn(userId.toString());
        when(
            profileService.updateProfile(
                eq(userId),
                any(UpdateProfileRequest.class)
            )
        ).thenReturn(response);

        mockMvc
            .perform(
                put("/profile")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.bio").value("Updated bio"))
            .andExpect(jsonPath("$.firstName").value("John"));

        verify(profileService, times(1)).updateProfile(
            eq(userId),
            any(UpdateProfileRequest.class)
        );
    }

    @Test
    /// Test: Updating profile info with empty request should succeed and return current profile data.
    void updateMyProfileInfo_withEmptyRequest_shouldSucceed() throws Exception {
        Long userId = 1L;
        UpdateProfileRequest request = new UpdateProfileRequest();

        ProfileResponse response = new ProfileResponse();
        response.setUsername("testuser");

        when(authentication.getName()).thenReturn(userId.toString());
        when(
            profileService.updateProfile(
                eq(userId),
                any(UpdateProfileRequest.class)
            )
        ).thenReturn(response);

        mockMvc
            .perform(
                put("/profile")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isOk());

        verify(profileService, times(1)).updateProfile(
            eq(userId),
            any(UpdateProfileRequest.class)
        );
    }

    @Test
    void updateMyProfileInfo_withInvalidFirstName_shouldReturnBadRequest()
        throws Exception {
        Long userId = 1L;
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("John123");
        request.setLastName("Doe");

        when(authentication.getName()).thenReturn(userId.toString());

        mockMvc
            .perform(
                put("/profile")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isBadRequest());

        verify(profileService, never()).updateProfile(
            anyLong(),
            any(UpdateProfileRequest.class)
        );
    }

    @Test
    void updateMyProfileInfo_withInvalidLastName_shouldReturnBadRequest()
        throws Exception {
        Long userId = 1L;
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("John");
        request.setLastName("Doe@");

        when(authentication.getName()).thenReturn(userId.toString());

        mockMvc
            .perform(
                put("/profile")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isBadRequest());

        verify(profileService, never()).updateProfile(
            anyLong(),
            any(UpdateProfileRequest.class)
        );
    }

    @Test
    /// Test: Updating profile picture with valid image file returns updated profile.
    void updateMyProfilePicture_shouldReturnUpdatedProfile() throws Exception {
        Long userId = 1L;
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "profile.jpg",
            "image/jpeg",
            "image data".getBytes()
        );

        ProfileResponse response = new ProfileResponse();
        response.setUsername("testuser");

        when(authentication.getName()).thenReturn(userId.toString());
        when(
            profileService.updateProfilePicture(
                eq(userId),
                any(MultipartFile.class)
            )
        ).thenReturn(response);

        mockMvc
            .perform(
                multipart("/profile/picture")
                    .file(file)
                    .with(request -> {
                        request.setMethod("PUT");
                        return request;
                    })
                    .principal(authentication)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("testuser"));

        verify(profileService, times(1)).updateProfilePicture(
            eq(userId),
            any(MultipartFile.class)
        );
    }

    @Test
    /// Test: Updating profile picture with invalid file type returns 400 error.
    void updateMyProfilePicture_withInvalidFileType_shouldReturnBadRequest()
        throws Exception {
        Long userId = 1L;
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "document.txt",
            "text/plain",
            "text data".getBytes()
        );

        when(authentication.getName()).thenReturn(userId.toString());
        when(
            profileService.updateProfilePicture(
                eq(userId),
                any(MultipartFile.class)
            )
        ).thenThrow(
            new CustomException("Invalid file type", HttpStatus.BAD_REQUEST)
        );

        mockMvc
            .perform(
                multipart("/profile/picture")
                    .file(file)
                    .with(request -> {
                        request.setMethod("PUT");
                        return request;
                    })
                    .principal(authentication)
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    /// Test: Updating profile picture without providing a file returns 500 error.
    void updateMyProfilePicture_withoutFile_shouldReturnError()
        throws Exception {
        Long userId = 1L;

        when(authentication.getName()).thenReturn(userId.toString());

        mockMvc
            .perform(
                multipart("/profile/picture")
                    .with(request -> {
                        request.setMethod("PUT");
                        return request;
                    })
                    .principal(authentication)
            )
            .andExpect(status().is5xxServerError());
    }

    @Test
    /// Test: Deleting profile picture with existing picture returns updated profile.
    void deleteMyProfilePicture_shouldReturnUpdatedProfile() throws Exception {
        Long userId = 1L;
        ProfileResponse response = new ProfileResponse();
        response.setUsername("testuser");

        when(authentication.getName()).thenReturn(userId.toString());
        when(profileService.deleteProfilePicture(userId)).thenReturn(response);

        mockMvc
            .perform(delete("/profile/picture").principal(authentication))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("testuser"));

        verify(profileService, times(1)).deleteProfilePicture(userId);
    }

    @Test
    /// Test: Deleting profile picture when no picture exists returns 404 error.
    void deleteMyProfilePicture_withNoExistingPicture_shouldReturnNotFound()
        throws Exception {
        Long userId = 1L;

        when(authentication.getName()).thenReturn(userId.toString());
        when(profileService.deleteProfilePicture(userId)).thenThrow(
            new CustomException(
                "No profile picture found",
                HttpStatus.NOT_FOUND
            )
        );

        mockMvc
            .perform(delete("/profile/picture").principal(authentication))
            .andExpect(status().isNotFound());
    }

    @Test
    /// Test: Deleting profile picture with invalid token throws 401 error.
    void deleteMyProfilePicture_withInvalidToken_shouldThrowException()
        throws Exception {
        when(authentication.getName()).thenReturn("invalid");

        mockMvc
            .perform(delete("/profile/picture").principal(authentication))
            .andExpect(status().isUnauthorized());
    }
}
