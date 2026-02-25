package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.auth.LoginRequest;
import com.example.moodly_social_api.dto.auth.AuthResponse;
import com.example.moodly_social_api.dto.auth.SignupRequest;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.entity.UserRole;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.UserRepository;
import com.example.moodly_social_api.security.JwtTokenProvider;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private final String USERNAME = "testUser";
    private final String EMAIL = "test@mail.com";
    private final String PASSWORD = "Password1!";
    private final String ENCODED_PASSWORD = "encodedPassword";
    private final String JWT_TOKEN = "jwt.token.here";
    private final Long USER_ID = 1L;
    private final List<UserRole> DEFAULT_ROLES = List.of(UserRole.ROLE_CLIENT);


    // signup
    @Test
    @DisplayName("Signup success – should create user, encode password, generate token")
    void signup_success() {
        SignupRequest request = new SignupRequest(USERNAME, EMAIL, PASSWORD);

        when(userRepository.existsByUsername(USERNAME)).thenReturn(false);
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(PASSWORD)).thenReturn(ENCODED_PASSWORD);

        // simulate DB assigning ID
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(USER_ID);
            return u;
        });

        when(jwtTokenProvider.createToken(eq(USER_ID), eq(DEFAULT_ROLES)))
                .thenReturn(JWT_TOKEN);

        AuthResponse response = authService.signup(request);

        assertThat(response.getUsername()).isEqualTo(USERNAME);
        assertThat(response.getToken()).isEqualTo(JWT_TOKEN);

        verify(userRepository).existsByUsername(USERNAME);
        verify(userRepository).existsByEmail(EMAIL);
        verify(passwordEncoder).encode(PASSWORD);
        verify(userRepository).save(userCaptor.capture());
        verify(jwtTokenProvider).createToken(USER_ID, DEFAULT_ROLES);

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo(USERNAME);
        assertThat(savedUser.getEmail()).isEqualTo(EMAIL);
        assertThat(savedUser.getPassword()).isEqualTo(ENCODED_PASSWORD);
        assertThat(savedUser.getAppUserRoles()).containsExactly(UserRole.ROLE_CLIENT);
        assertThat(savedUser.getId()).isEqualTo(USER_ID);
    }

    @Test
    @DisplayName("Signup fail – username already taken throws exception")
    void signup_usernameTaken_throwsException() {
        SignupRequest request = new SignupRequest(USERNAME, EMAIL, PASSWORD);
        when(userRepository.existsByUsername(USERNAME)).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Username already taken");

        verify(userRepository, never()).existsByEmail(anyString());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
        verify(jwtTokenProvider, never()).createToken(anyLong(), anyList());
    }

    @Test
    @DisplayName("Signup fail – email already taken throws exception")
    void signup_emailTaken_throwsException() {
        SignupRequest request = new SignupRequest(USERNAME, EMAIL, PASSWORD);
        when(userRepository.existsByUsername(USERNAME)).thenReturn(false);
        when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already taken");

        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
        verify(jwtTokenProvider, never()).createToken(anyLong(), anyList());
    }

    // signin

    @Test
    @DisplayName("Signin success – valid credentials return token")
    void signin_success() {
        LoginRequest request = new LoginRequest(USERNAME, PASSWORD);
        Authentication auth = new UsernamePasswordAuthenticationToken(USERNAME, PASSWORD);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);

        User user = new User();
        user.setId(USER_ID);
        user.setUsername(USERNAME);
        user.setEmail(EMAIL);
        user.setAppUserRoles(DEFAULT_ROLES);

        Profile profile = new Profile();
        profile.setId(100L);
        user.setProfile(profile);

        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
        when(jwtTokenProvider.createToken(USER_ID, DEFAULT_ROLES)).thenReturn(JWT_TOKEN);

        AuthResponse response = authService.signin(request);

        assertThat(response.getUsername()).isEqualTo(USERNAME);
        assertThat(response.getToken()).isEqualTo(JWT_TOKEN);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByUsername(USERNAME);
        verify(jwtTokenProvider).createToken(USER_ID, DEFAULT_ROLES);
    }


    @Test
    @DisplayName("Signin fail – invalid credentials throws exception")
    void signin_invalidCredentials_throwsException() {
        LoginRequest request = new LoginRequest(USERNAME, "wrongPassword");
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid username or password"));

        assertThatThrownBy(() -> authService.signin(request))
                .isInstanceOf(CustomException.class)
                .hasMessage("Invalid username or password");

        verify(userRepository, never()).findByUsername(anyString());
        verify(jwtTokenProvider, never()).createToken(anyLong(), anyList());
    }

    @Test
    @DisplayName("Signin fail – authenticated but user not found in DB throws exception")
    void signin_userNotFoundAfterAuth_throwsException() {
        LoginRequest request = new LoginRequest(USERNAME, PASSWORD);
        Authentication auth = new UsernamePasswordAuthenticationToken(USERNAME, PASSWORD);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.signin(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByUsername(USERNAME);
        verify(jwtTokenProvider, never()).createToken(anyLong(), anyList());
    }
}
