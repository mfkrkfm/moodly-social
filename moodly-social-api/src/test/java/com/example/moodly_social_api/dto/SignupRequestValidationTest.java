package com.example.moodly_social_api.dto;

import com.example.moodly_social_api.dto.auth.SignupRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class SignupRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setupValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Empty fields should violate @NotBlank on all three")
    void emptyFields_failsValidation() {
        SignupRequest request = new SignupRequest();

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);
        Set<String> propertyPaths = violations.stream()
                .map(v -> v.getPropertyPath().toString())
                .collect(Collectors.toSet());

        assertThat(propertyPaths).containsExactlyInAnyOrder("username", "email", "password");
        violations.forEach(v -> {
            if ("password".equals(v.getPropertyPath().toString())) {
                assertThat(v.getMessage()).isEqualTo("Password is required");
            } else {
                assertThat(v.getMessage()).isEqualTo("must not be blank");
            }
        });
    }

    @Test
    @DisplayName("Invalid email format should trigger @Email violation")
    void invalidEmail_failsValidation() {
        SignupRequest request = new SignupRequest();
        request.setUsername("validUser");
        request.setEmail("not-an-email");
        request.setPassword("Password1!");

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).hasSize(1);
        ConstraintViolation<SignupRequest> violation = violations.iterator().next();
        assertThat(violation.getPropertyPath().toString()).isEqualTo("email");
        assertThat(violation.getMessage()).isEqualTo("Email must be a valid email address");
    }

    @Test
    @DisplayName("Valid request should pass validation")
    void validRequest_passesValidation() {
        SignupRequest request = new SignupRequest();
        request.setUsername("user123");
        request.setEmail("user@mail.com");
        request.setPassword("Password1!");

        Set<ConstraintViolation<SignupRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

}