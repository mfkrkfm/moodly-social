package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.admin.AdminUserResponse;
import com.example.moodly_social_api.dto.admin.UpdateUserRolesRequest;
import com.example.moodly_social_api.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<AdminUserResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request
    ) {
        return ResponseEntity.ok(adminUserService.updateUserRoles(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
