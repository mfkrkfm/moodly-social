package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.admin.AdminUserResponse;
import com.example.moodly_social_api.dto.admin.UpdateUserRolesRequest;
import com.example.moodly_social_api.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequiredArgsConstructor

public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        log.info("GET /admin/users - fetch all users");
        List<AdminUserResponse> users = adminUserService.getAllUsers();
        log.info("GET /admin/users - found {} users", users.size());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        log.info("GET /admin/users/{} - fetch user", id);
        AdminUserResponse user = adminUserService.getUserById(id);
        log.info("GET /admin/users/{} - user found: username={}", id, user.getUsername());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<AdminUserResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request
    ) {
        log.info("PUT /admin/users/{}/roles - update roles: roles={}", id, request.getRoles());
        AdminUserResponse updated = adminUserService.updateUserRoles(id, request);
        log.info("PUT /admin/users/{}/roles - roles updated: username={}", id, updated.getUsername());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("DELETE /admin/users/{} - delete user", id);
        adminUserService.deleteUser(id);
        log.info("DELETE /admin/users/{} - user deleted", id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}