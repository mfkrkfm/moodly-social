package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.SignupRequest;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.entity.UserRole;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import com.example.moodly_social_api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public String signin(String username, String password) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
            return jwtTokenProvider.createToken(username, user.getAppUserRoles());
        } catch (AuthenticationException e) {
            throw new CustomException("Invalid username/password", HttpStatus.UNAUTHORIZED);
        }
    }

    public String signup(SignupRequest signupRequest) {
        // Check uniqueness
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new CustomException("Username already taken", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        }

        // Create new user with default role CLIENT
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setAppUserRoles(Collections.singletonList(UserRole.ROLE_CLIENT));

        userRepository.save(user);
        return jwtTokenProvider.createToken(user.getUsername(), user.getAppUserRoles());
    }

    public void delete(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new CustomException("User not found", HttpStatus.NOT_FOUND);
        }
        userRepository.deleteByUsername(username);
    }
}
