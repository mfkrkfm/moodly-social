package com.example.moodly_social_api.service.mapper;

import com.example.moodly_social_api.dto.comment.CommentResponse;
import com.example.moodly_social_api.entity.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CommentMapper {

    private final ProfileMapper profileMapper;

    public CommentResponse toCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setPostId(comment.getPost() != null ? comment.getPost().getId() : null);
        response.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setEdited(comment.isEdited());
        if (comment.getAuthor() != null && comment.getAuthor().getUser() != null) {
            response.setAuthorUsername(comment.getAuthor().getUser().getUsername());
        }
        response.setAuthorPicture(profileMapper.toProfilePictureResponse(comment.getAuthor()));
        return response;
    }

    public List<CommentResponse> toCommentTree(List<Comment> comments) {
        if (comments == null || comments.isEmpty()) {
            return List.of();
        }

        Map<Long, CommentResponse> byId = new LinkedHashMap<>();
        for (Comment comment : comments) {
            byId.put(comment.getId(), toCommentResponse(comment));
        }

        List<CommentResponse> roots = new ArrayList<>();
        for (Comment comment : comments) {
            CommentResponse current = byId.get(comment.getId());
            Comment parent = comment.getParentComment();
            if (parent != null && parent.getId() != null) {
                CommentResponse parentResponse = byId.get(parent.getId());
                if (parentResponse != null) {
                    parentResponse.getReplies().add(current);
                    continue;
                }
            }
            roots.add(current);
        }

        return roots;
    }
}
