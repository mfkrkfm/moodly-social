package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.AdminUserResponse;
import com.example.moodly_social_api.dto.UpdateUserRolesRequest;
import com.example.moodly_social_api.exception.CustomException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        throw new CustomException("Not implemented yet: getAllUsers", HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        throw new CustomException("Not implemented yet: getUserById", HttpStatus.NOT_IMPLEMENTED);
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<AdminUserResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request
    ) {
        throw new CustomException("Not implemented yet: updateUserRoles", HttpStatus.NOT_IMPLEMENTED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        throw new CustomException("Not implemented yet: deleteUser", HttpStatus.NOT_IMPLEMENTED);
    }
}
