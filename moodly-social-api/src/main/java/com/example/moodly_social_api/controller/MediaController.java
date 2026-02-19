package com.example.moodly_social_api.controller;

import com.example.moodly_social_api.exception.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/media")
public class MediaController {

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getMedia(@PathVariable Long id) {
        throw new CustomException("Not implemented yet: getMedia", HttpStatus.NOT_IMPLEMENTED);
    }
}
