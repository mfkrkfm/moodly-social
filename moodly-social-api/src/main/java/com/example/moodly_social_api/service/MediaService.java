package com.example.moodly_social_api.service;

import com.example.moodly_social_api.entity.Picture;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.PictureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final PictureRepository pictureRepository;

    @Transactional(readOnly = true)
    public byte[] getMediaContent(Long id) {
        Picture picture = pictureRepository.findById(id)
                .orElseThrow(() -> new CustomException("Media not found", HttpStatus.NOT_FOUND));

        byte[] content = picture.getContent();
        if (content == null || content.length == 0) {
            throw new CustomException("Media content is empty", HttpStatus.NOT_FOUND);
        }
        return content;
    }
}
