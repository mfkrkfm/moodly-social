package com.example.moodly_social_api.service.mapper;

import com.example.moodly_social_api.dto.post.PictureResponse;
import com.example.moodly_social_api.entity.Picture;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PictureMapper {
    public List<PictureResponse> toPictureResponses(List<Picture> pictures) {
        if (pictures == null) {
            return Collections.emptyList();
        }

        return pictures.stream()
                .map(picture -> {
                    PictureResponse response = new PictureResponse();
                    response.setId(picture.getId());
                    response.setUrl("/media/" + picture.getId());
                    return response;
                })
                .toList();
    }
}
