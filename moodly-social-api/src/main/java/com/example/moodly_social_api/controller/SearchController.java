package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.dto.publicprofile.PublicUserCardResponse;
import com.example.moodly_social_api.service.PublicProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final PublicProfileService publicProfileService;

    @GetMapping("/users")
    public ResponseEntity<List<PublicUserCardResponse>> searchUsers(
            @RequestParam("q") String query
    ) {
        log.info("GET /search/users?q={}", query);
        List<PublicUserCardResponse> results = publicProfileService.searchUsers(query.trim());
        log.info("GET /search/users - found {} results", results.size());
        return ResponseEntity.ok(results);
    }
}

