package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.LoginRequest;
import com.example.moodly_social_api.dto.SignupRequest;
import com.example.moodly_social_api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class AuthController {

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
}
