package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.auth.AuthResponse;
import com.example.moodly_social_api.dto.auth.LoginRequest;
import com.example.moodly_social_api.dto.auth.SignupRequest;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.entity.UserRole;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import com.example.moodly_social_api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse signin(LoginRequest request) {

        try {

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            String username = authentication.getName();

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new CustomException(
                            "User not found",
                            HttpStatus.NOT_FOUND
                    ));

            String token = jwtTokenProvider.createToken(
                    user.getId(),
                    user.getAppUserRoles()
            );

            return new AuthResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getAppUserRoles()
                            .stream()
                            .map(Enum::name)
                            .toList(),
                    user.getProfile().getId()
            );

        } catch (AuthenticationException e) {
            throw new CustomException(
                    "Invalid username or password",
                    HttpStatus.UNAUTHORIZED
            );
        }
    }

    public AuthResponse signup(SignupRequest signupRequest) {

        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new CustomException("Username already taken", HttpStatus.CONFLICT);
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new CustomException("Email already taken", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        // Assign default role
        user.setAppUserRoles(getDefaultRoles());

        user.setProfile(new Profile());

        User savedUser = userRepository.save(user);

        // Generate JWT
        String token = jwtTokenProvider.createToken(
                savedUser.getId(),
                savedUser.getAppUserRoles()
        );

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getAppUserRoles()
                        .stream()
                        .map(Enum::name)
                        .toList(),
                savedUser.getProfile().getId()
        );
    }

    private List<UserRole> getDefaultRoles() {
        return List.of(UserRole.ROLE_CLIENT);
    }

}
