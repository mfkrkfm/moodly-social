package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.admin.AdminUserResponse;
import com.example.moodly_social_api.dto.admin.UpdateUserRolesRequest;
import com.example.moodly_social_api.entity.UserRole;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.exception.GlobalExceptionHandler;
import com.example.moodly_social_api.service.AdminUserService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AdminUserService adminUserService;

    @InjectMocks
    private AdminUserController adminUserController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminUserController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void getAllUsers_shouldReturnListOfUsers() throws Exception {
        AdminUserResponse user1 = new AdminUserResponse();
        user1.setId(1L);
        user1.setUsername("user1");
        user1.setEmail("user1@example.com");

        AdminUserResponse user2 = new AdminUserResponse();
        user2.setId(2L);
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");

        List<AdminUserResponse> users = Arrays.asList(user1, user2);

        when(adminUserService.getAllUsers()).thenReturn(users);

        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].username").value("user1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].username").value("user2"));

        verify(adminUserService, times(1)).getAllUsers();
    }

    @Test
    void getAllUsers_withNoUsers_shouldReturnEmptyList() throws Exception {
        when(adminUserService.getAllUsers()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getUserById_shouldReturnUser() throws Exception {
        Long userId = 1L;
        AdminUserResponse user = new AdminUserResponse();
        user.setId(userId);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setRoles(List.of(UserRole.ROLE_CLIENT));

        when(adminUserService.getUserById(userId)).thenReturn(user);

        mockMvc.perform(get("/admin/users/{id}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(adminUserService, times(1)).getUserById(userId);
    }

    @Test
    void getUserById_withNonExistingUser_shouldReturnNotFound() throws Exception {
        Long userId = 999L;

        when(adminUserService.getUserById(userId))
                .thenThrow(new CustomException("User not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/admin/users/{id}", userId))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateUserRoles_shouldReturnUpdatedUser() throws Exception {
        Long userId = 1L;
        UpdateUserRolesRequest request = new UpdateUserRolesRequest();
        request.setRoles(Arrays.asList(UserRole.ROLE_CLIENT, UserRole.ROLE_ADMIN));

        AdminUserResponse response = new AdminUserResponse();
        response.setId(userId);
        response.setUsername("testuser");
        response.setRoles(Arrays.asList(UserRole.ROLE_CLIENT, UserRole.ROLE_ADMIN));

        when(adminUserService.updateUserRoles(eq(userId), any(UpdateUserRolesRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/admin/users/{id}/roles", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.username").value("testuser"));

        verify(adminUserService, times(1)).updateUserRoles(eq(userId), any(UpdateUserRolesRequest.class));
    }

    @Test
    void updateUserRoles_withEmptyRoles_shouldReturnBadRequest() throws Exception {
        Long userId = 1L;
        UpdateUserRolesRequest request = new UpdateUserRolesRequest();
        request.setRoles(Collections.emptyList());

        mockMvc.perform(put("/admin/users/{id}/roles", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(adminUserService, never()).updateUserRoles(any(), any());
    }

    @Test
    void updateUserRoles_withNonExistingUser_shouldReturnNotFound() throws Exception {
        Long userId = 999L;
        UpdateUserRolesRequest request = new UpdateUserRolesRequest();
        request.setRoles(List.of(UserRole.ROLE_CLIENT));

        when(adminUserService.updateUserRoles(eq(userId), any(UpdateUserRolesRequest.class)))
                .thenThrow(new CustomException("User not found", HttpStatus.NOT_FOUND));

        mockMvc.perform(put("/admin/users/{id}/roles", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteUser_shouldReturnNoContent() throws Exception {
        Long userId = 1L;

        doNothing().when(adminUserService).deleteUser(userId);

        mockMvc.perform(delete("/admin/users/{id}", userId))
                .andExpect(status().isNoContent());

        verify(adminUserService, times(1)).deleteUser(userId);
    }

    @Test
    void deleteUser_withNonExistingUser_shouldReturnNotFound() throws Exception {
        Long userId = 999L;

        doThrow(new CustomException("User not found", HttpStatus.NOT_FOUND))
                .when(adminUserService).deleteUser(userId);

        mockMvc.perform(delete("/admin/users/{id}", userId))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteUser_withLastAdmin_shouldReturnBadRequest() throws Exception {
        Long userId = 1L;

        doThrow(new CustomException("Cannot delete last admin", HttpStatus.BAD_REQUEST))
                .when(adminUserService).deleteUser(userId);

        mockMvc.perform(delete("/admin/users/{id}", userId))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteUser_withAssociatedData_shouldDeleteUserAndData() throws Exception {
        Long userId = 1L;

        doNothing().when(adminUserService).deleteUser(userId);

        mockMvc.perform(delete("/admin/users/{id}", userId))
                .andExpect(status().isNoContent());

        verify(adminUserService, times(1)).deleteUser(userId);
    }
}







