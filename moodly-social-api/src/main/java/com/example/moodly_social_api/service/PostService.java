package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.post.PostRequest;
import com.example.moodly_social_api.dto.post.LikeResponse;
import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.entity.Picture;
import com.example.moodly_social_api.entity.Post;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.PostRepository;
import com.example.moodly_social_api.repository.UserRepository;
import com.example.moodly_social_api.service.mapper.PostMapper;
import com.example.moodly_social_api.service.mapper.ProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;
    private final ProfileMapper profileMapper;

    @Transactional
    public PostResponse createPost(Long currentUserId, PostRequest request, List<MultipartFile> files) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        validateCanPostToday(currentProfile.getId());

        Post post = new Post();
        post.setContent(request.getContent());
        post.setMood(request.getMood());
        post.setEdited(false);
        post.setCreatedAt(LocalDateTime.now());
        post.setAuthor(currentProfile);
        post.setPictures(toPictures(files));

        Post saved = postRepository.save(post);
        return postMapper.toPostResponse(saved, currentProfile.getId());
    }

    private void validateCanPostToday(Long profileId) {
        if (!canPostToday(profileId)) {
            throw new CustomException("Daily post limit reached (max 3 posts per day)", HttpStatus.BAD_REQUEST);
        }
    }

    private boolean canPostToday(Long profileId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime nextDayStart = startOfDay.plusDays(1);
        long todayPosts = postRepository.countByAuthor_IdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                profileId,
                startOfDay,
                nextDayStart
        );
        return todayPosts < 3;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(Long currentUserId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> postMapper.toPostResponse(post, currentProfile.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long postId, Long currentUserId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);
        return postMapper.toPostResponse(post, currentProfile.getId());
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> getPostLikes(Long postId) {
        Post post = getPost(postId);
        return profileMapper.toProfileResponses(post.getLikedBy());
    }

    @Transactional
    public PostResponse updatePost(Long currentUserId, Long postId, PostRequest request) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        validateAuthor(post, currentProfile);

        post.setContent(request.getContent());
        post.setMood(request.getMood());
        post.setEdited(true);

        return postMapper.toPostResponse(post, currentProfile.getId());
    }

    @Transactional
    public void deletePost(Long currentUserId, Long postId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        validateAuthor(post, currentProfile);
        postRepository.delete(post);
    }

    @Transactional
    public LikeResponse likePost(Long currentUserId, Long postId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        post.getLikedBy().add(currentProfile);
        return toLikeResponse(post, true);
    }

    @Transactional
    public LikeResponse unlikePost(Long currentUserId, Long postId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);

        post.getLikedBy().remove(currentProfile);
        return toLikeResponse(post, false);
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

    private void validateAuthor(Post post, Profile currentProfile) {
        if (post.getAuthor() == null || !post.getAuthor().getId().equals(currentProfile.getId())) {
            throw new CustomException("You are not allowed to modify this post", HttpStatus.FORBIDDEN);
        }
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

    private LikeResponse toLikeResponse(Post post, boolean liked) {
        LikeResponse response = new LikeResponse();
        response.setPostId(post.getId());
        response.setLiked(liked);
        response.setLikesCount(post.getLikedBy() != null ? post.getLikedBy().size() : 0);
        return response;
    }

}
