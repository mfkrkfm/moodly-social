package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.auth.LoginRequest;
import com.example.moodly_social_api.dto.auth.SignupRequest;
import com.example.moodly_social_api.dto.auth.AuthResponse;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.exception.GlobalExceptionHandler;
import com.example.moodly_social_api.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void login_shouldReturnToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        AuthResponse response = new AuthResponse(
                "fake-jwt-token",
                1L,
                "testuser",
                "test@example.com",
                "ROLE_USER",
                1L
        );

        Mockito.when(authService.signin(Mockito.any(LoginRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));

        verify(authService, times(1)).signin(any(LoginRequest.class));
    }

    @Test
    void login_withInvalidCredentials_shouldReturnUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");

        when(authService.signin(any(LoginRequest.class)))
                .thenThrow(new CustomException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withEmptyUsername_shouldReturnBadRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("");
        request.setPassword("password");

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).signin(any());
    }

    @Test
    void login_withEmptyPassword_shouldReturnBadRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("");

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).signin(any());
    }

    @Test
    void login_withNonExistingUser_shouldReturnUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("password");

        when(authService.signin(any(LoginRequest.class)))
                .thenThrow(new CustomException("User not found", HttpStatus.UNAUTHORIZED));

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void signup_shouldReturnToken() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("Password123!");

        AuthResponse response = new AuthResponse(
                "fake-jwt-token",
                2L,
                "newuser",
                "newuser@example.com",
                "ROLE_USER",
                2L
        );

        when(authService.signup(any(SignupRequest.class))).thenReturn(response);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"))
                .andExpect(jsonPath("$.userId").value(2))
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.email").value("newuser@example.com"));

        verify(authService, times(1)).signup(any(SignupRequest.class));
    }

    @Test
    void signup_withExistingUsername_shouldReturnConflict() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setUsername("existinguser");
        request.setEmail("new@example.com");
        request.setPassword("Password123!");

        when(authService.signup(any(SignupRequest.class)))
                .thenThrow(new CustomException("Username already exists", HttpStatus.CONFLICT));

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void signup_withExistingEmail_shouldReturnConflict() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setUsername("newuser");
        request.setEmail("existing@example.com");
        request.setPassword("Password123!");

        when(authService.signup(any(SignupRequest.class)))
                .thenThrow(new CustomException("Email already exists", HttpStatus.CONFLICT));

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void signup_withInvalidEmail_shouldReturnBadRequest() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setUsername("newuser");
        request.setEmail("invalid-email");
        request.setPassword("password123");

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).signup(any());
    }

    @Test
    void signup_withShortPassword_shouldReturnBadRequest() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("123");

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).signup(any());
    }

    @Test
    void signup_withEmptyUsername_shouldReturnBadRequest() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setUsername("");
        request.setEmail("new@example.com");
        request.setPassword("password123");

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).signup(any());
    }

    @Test
    void signup_withMissingFields_shouldReturnBadRequest() throws Exception {
        SignupRequest request = new SignupRequest();

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).signup(any());
    }
}