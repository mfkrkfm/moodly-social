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

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        log.info("Admin request: Fetching all users");
        List<AdminUserResponse> users = adminUserService.getAllUsers();
        log.debug("Fetched {} users", users.size());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        log.info("Admin request: Fetching user with id={}", id);
        AdminUserResponse user = adminUserService.getUserById(id);
        log.debug("Fetched user: {}", user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<AdminUserResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request
    ) {
        log.info("Admin request: Updating roles for user id={}", id);
        log.debug("New roles payload: {}", request);

        AdminUserResponse updatedUser = adminUserService.updateUserRoles(id, request);

        log.info("Successfully updated roles for user id={}", id);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.warn("Admin request: Deleting user with id={}", id);
        adminUserService.deleteUser(id);
        log.info("User with id={} deleted successfully", id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}