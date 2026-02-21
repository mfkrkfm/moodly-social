package com.example.moodly_social_api.service.mapper;

import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.entity.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostMapper {

    private final ProfileMapper profileMapper;
    private final CommentMapper commentMapper;
    private final PictureMapper pictureMapper;

    public PostResponse toPostResponse(Post post, Long currentProfileId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setAuthorUsername(post.getAuthor().getUser().getUsername());
        response.setAuthorPicture(profileMapper.toProfilePictureResponse(post.getAuthor()));
        response.setContent(post.getContent());
        response.setEdited(post.isEdited());
        response.setMood(post.getMood());
        response.setCreatedAt(post.getCreatedAt());
        response.setLikesCount(post.getLikedBy() != null ? post.getLikedBy().size() : 0);
        response.setCommentsCount(post.getComments() != null ? post.getComments().size() : 0);
        response.setPictures(pictureMapper.toPictureResponses(post.getPictures()));
        response.setLikedByMe(isLikedByCurrentUser(post, currentProfileId));
        response.setComments(commentMapper.toCommentTree(post.getComments()));
        response.setLikedBy(profileMapper.toProfileResponses(post.getLikedBy()));
        return response;
    }

    public boolean isLikedByCurrentUser(Post post, Long currentProfileId) {
        if (currentProfileId == null || post.getLikedBy() == null) {
            return false;
        }

        return post.getLikedBy()
                .stream()
                .anyMatch(profile -> profile.getId().equals(currentProfileId));
    }

}
