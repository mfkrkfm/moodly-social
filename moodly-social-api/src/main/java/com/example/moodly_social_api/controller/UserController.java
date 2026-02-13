package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.LoginRequest;
import com.example.moodly_social_api.dto.SignupRequest;
import com.example.moodly_social_api.dto.UserResponse;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signin")
    public String signin(@Valid @RequestBody LoginRequest loginRequest) {
        return userService.signin(loginRequest.getUsername(), loginRequest.getPassword());
    }

    @PostMapping("/signup")
    public String signup(@Valid @RequestBody SignupRequest signupRequest) {
        return userService.signup(signupRequest);
    }

    @DeleteMapping("/{username}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String delete(@PathVariable String username) {
        userService.delete(username);
        return username;
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setAppUserRoles(user.getAppUserRoles());
        return response;
    }
}
