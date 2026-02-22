package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.auth.AuthResponse;
import com.example.moodly_social_api.dto.auth.LoginRequest;
import com.example.moodly_social_api.dto.auth.SignupRequest;
import com.example.moodly_social_api.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /auth/signin - sign in attempt: username={}", request.getUsername());
        AuthResponse response = authService.signin(request);
        log.info("POST /auth/signin - sign in successful: username={}", request.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        log.info("POST /auth/signup - registration attempt: username={}, email={}", request.getUsername(), request.getEmail());
        AuthResponse response = authService.signup(request);
        log.info("POST /auth/signup - registration successful: username={}", request.getUsername());
        return ResponseEntity.ok(response);
    }

}
