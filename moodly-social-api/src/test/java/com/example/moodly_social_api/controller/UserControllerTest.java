package com.example.moodly_social_api.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.moodly_social_api.dto.user.UpdateUserRequest;
import com.example.moodly_social_api.dto.user.UserResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.exception.GlobalExceptionHandler;
import com.example.moodly_social_api.service.UserService;
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

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserController userController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    /// Test: Getting user info with valid token returns user data.
    void getMyUser_shouldReturnUserData() throws Exception {
        Long userId = 1L;
        UserResponse userResponse = new UserResponse();
        userResponse.setId(userId);
        userResponse.setUsername("testuser");
        userResponse.setEmail("test@example.com");

        when(authentication.getName()).thenReturn(userId.toString());
        when(userService.getUser(userId)).thenReturn(userResponse);

        mockMvc
            .perform(get("/account").principal(authentication))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(userId))
            .andExpect(jsonPath("$.username").value("testuser"))
            .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(userService, times(1)).getUser(userId);
    }

    @Test
    /// Test: Getting user info with invalid token returns 401 error.
    void getMyUser_withInvalidToken_shouldThrowException() throws Exception {
        when(authentication.getName()).thenReturn("invalid");

        mockMvc
            .perform(get("/account").principal(authentication))
            .andExpect(status().isUnauthorized());
    }

    @Test
    /// Test: Updating user info with valid data returns updated user.
    void updateMyUser_shouldReturnUpdatedUser() throws Exception {
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("updateduser");
        request.setEmail("updated@example.com");

        UserResponse userResponse = new UserResponse();
        userResponse.setId(userId);
        userResponse.setUsername("updateduser");
        userResponse.setEmail("updated@example.com");

        when(authentication.getName()).thenReturn(userId.toString());
        when(
            userService.updateUser(eq(userId), any(UpdateUserRequest.class))
        ).thenReturn(userResponse);

        mockMvc
            .perform(
                put("/account")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("updateduser"))
            .andExpect(jsonPath("$.email").value("updated@example.com"));

        verify(userService, times(1)).updateUser(
            eq(userId),
            any(UpdateUserRequest.class)
        );
    }

    @Test
    /// Test: Updating user info with invalid data returns 400 error.
    void updateMyUser_withInvalidData_shouldReturnBadRequest()
        throws Exception {
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest();

        when(authentication.getName()).thenReturn(userId.toString());

        mockMvc
            .perform(
                put("/account")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isBadRequest());

        verify(userService, never()).updateUser(any(), any());
    }

    @Test
    void updateMyUser_withInvalidUsernameFormat_shouldReturnBadRequest()
        throws Exception {
        Long userId = 1L;
        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("bad user");
        request.setEmail("updated@example.com");

        when(authentication.getName()).thenReturn(userId.toString());

        mockMvc
            .perform(
                put("/account")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isBadRequest());

        verify(userService, never()).updateUser(
            anyLong(),
            any(UpdateUserRequest.class)
        );
    }

    @Test
    /// Test: Updating user info with invalid token returns 401 error.
    void updateMyUser_withInvalidToken_shouldThrowException() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("updateduser");
        request.setEmail("updated@example.com");

        when(authentication.getName()).thenReturn("invalid");

        mockMvc
            .perform(
                put("/account")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isUnauthorized());
    }

    @Test
    /// Test: Updating user info for non-existing user returns 404 error.
    void updateMyUser_withNonExistingUser_shouldReturnNotFound()
        throws Exception {
        Long userId = 999L;
        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("updateduser");
        request.setEmail("updated@example.com");

        when(authentication.getName()).thenReturn(userId.toString());
        when(
            userService.updateUser(eq(userId), any(UpdateUserRequest.class))
        ).thenThrow(
            new CustomException("User not found", HttpStatus.NOT_FOUND)
        );

        mockMvc
            .perform(
                put("/account")
                    .principal(authentication)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andExpect(status().isNotFound());
    }
}
