package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.post.PictureResponse;
import com.example.moodly_social_api.dto.post.PostRequest;
import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.entity.Picture;
import com.example.moodly_social_api.entity.Post;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.PostRepository;
import com.example.moodly_social_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public PostResponse createPost(Long currentUserId, PostRequest request, List<MultipartFile> files) {
        Profile currentProfile = getCurrentProfile(currentUserId);

        Post post = new Post();
        post.setContent(request.getContent());
        post.setMood(request.getMood());
        post.setEdited(false);
        post.setCreatedAt(LocalDateTime.now());
        post.setAuthor(currentProfile);
        post.setPictures(toPictures(files));

        Post saved = postRepository.save(post);
        return toPostResponse(saved, currentProfile.getId());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(Long currentUserId) {
        Long currentProfileId = getCurrentProfileIdOrNull(currentUserId);
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> toPostResponse(post, currentProfileId))
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long postId, Long currentUserId) {
        Long currentProfileId = getCurrentProfileIdOrNull(currentUserId);
        Post post = getPost(postId);
        return toPostResponse(post, currentProfileId);
    }

    @Transactional
    public PostResponse updatePost(Long currentUserId, Long postId, PostRequest request) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        validateAuthor(post, currentProfile);

        post.setContent(request.getContent());
        post.setMood(request.getMood());
        post.setEdited(true);

        return toPostResponse(post, currentProfile.getId());
    }

    @Transactional
    public void deletePost(Long currentUserId, Long postId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        validateAuthor(post, currentProfile);
        postRepository.delete(post);
    }

    @Transactional
    public PostResponse likePost(Long currentUserId, Long postId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        post.getLikedBy().add(currentProfile);
        return toPostResponse(post, currentProfile.getId());
    }

    @Transactional
    public PostResponse unlikePost(Long currentUserId, Long postId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        post.getLikedBy().remove(currentProfile);
        return toPostResponse(post, currentProfile.getId());
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new CustomException("Post not found", HttpStatus.NOT_FOUND));
    }

    private Profile getCurrentProfile(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        Profile profile = user.getProfile();
        if (profile == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }
        return profile;
    }

    private Long getCurrentProfileIdOrNull(Long currentUserId) {
        if (currentUserId == null) {
            return null;
        }
        return getCurrentProfile(currentUserId).getId();
    }

    private void validateAuthor(Post post, Profile currentProfile) {
        if (post.getAuthor() == null || !post.getAuthor().getId().equals(currentProfile.getId())) {
            throw new CustomException("You are not allowed to modify this post", HttpStatus.FORBIDDEN);
        }
    }

    private PostResponse toPostResponse(Post post, Long currentProfileId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setContent(post.getContent());
        response.setEdited(post.isEdited());
        response.setMood(post.getMood());
        response.setCreatedAt(post.getCreatedAt());
        response.setLikesCount(post.getLikedBy() != null ? post.getLikedBy().size() : 0);
        response.setCommentsCount(post.getComments() != null ? post.getComments().size() : 0);
        response.setPictures(toPictureResponses(post.getPictures()));
        response.setLikedByMe(isLikedByCurrentUser(post, currentProfileId));
        return response;
    }

    private List<PictureResponse> toPictureResponses(List<Picture> pictures) {
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

    private List<Picture> toPictures(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        List<Picture> pictures = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            Picture picture = new Picture();
            try {
                picture.setContent(file.getBytes());
            } catch (IOException e) {
                throw new CustomException("Failed to read uploaded file", HttpStatus.BAD_REQUEST);
            }
            pictures.add(picture);
        }
        return pictures;
    }

    private boolean isLikedByCurrentUser(Post post, Long currentProfileId) {
        if (currentProfileId == null || post.getLikedBy() == null) {
            return false;
        }

        return post.getLikedBy()
                .stream()
                .anyMatch(profile -> profile.getId().equals(currentProfileId));
    }

}
