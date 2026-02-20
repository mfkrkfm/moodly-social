package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.comment.CommentResponse;
import com.example.moodly_social_api.dto.post.PictureResponse;
import com.example.moodly_social_api.dto.post.PostRequest;
import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.profile.ProfileResponse;
import com.example.moodly_social_api.entity.Comment;
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
import java.time.LocalDate;
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
        validateCanPostToday(currentProfile.getId());

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
                .map(post -> toPostResponse(post, currentProfile.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long postId, Long currentUserId) {
        Profile currentProfile = getCurrentProfile(currentUserId);
        Post post = getPost(postId);
        return toPostResponse(post, currentProfile.getId());
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

    private void validateAuthor(Post post, Profile currentProfile) {
        if (post.getAuthor() == null || !post.getAuthor().getId().equals(currentProfile.getId())) {
            throw new CustomException("You are not allowed to modify this post", HttpStatus.FORBIDDEN);
        }
    }

    private PostResponse toPostResponse(Post post, Long currentProfileId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setAuthorUsername(post.getAuthor().getUser().getUsername());
        response.setAuthorPicture(toAvatar(post.getAuthor()));
        response.setContent(post.getContent());
        response.setEdited(post.isEdited());
        response.setMood(post.getMood());
        response.setCreatedAt(post.getCreatedAt());
        response.setLikesCount(post.getLikedBy() != null ? post.getLikedBy().size() : 0);
        response.setCommentsCount(post.getComments() != null ? post.getComments().size() : 0);
        response.setPictures(toPictureResponses(post.getPictures()));
        response.setLikedByMe(isLikedByCurrentUser(post, currentProfileId));
        response.setComments(toCommentResponses(post.getComments()));
        response.setLikedBy(toProfileResponses(post.getLikedBy()));
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

    private List<CommentResponse> toCommentResponses(List<Comment> comments) {
        if (comments == null) {
            return Collections.emptyList();
        }

        return comments.stream()
                .map(comment -> {
                    CommentResponse response = new CommentResponse();
                    response.setId(comment.getId());
                    response.setContent(comment.getContent());
                    response.setAuthorUsername(comment.getAuthor().getUser().getUsername());
                    response.setAuthorPicture(toAvatar(comment.getAuthor()));
                    response.setCreatedAt(comment.getCreatedAt());
                    response.setEdited(comment.isEdited());
                    return response;
                })
                .toList();
    }

    private List<ProfileResponse> toProfileResponses(Iterable<Profile> profiles) {
        if (profiles == null) {
            return Collections.emptyList();
        }

        List<ProfileResponse> responses = new ArrayList<>();
        for (Profile profile : profiles) {
            ProfileResponse response = new ProfileResponse();
            response.setUsername(profile.getUser().getUsername());
            response.setAuthorPicture(toAvatar(profile));
            response.setFirstName(profile.getFirstName());
            response.setLastName(profile.getLastName());
            response.setBio(profile.getBio());
            response.setBirthDate(profile.getBirthDate());
            response.setMood(profile.getMood());
            responses.add(response);
        }
        return responses;
    }

    private PictureResponse toAvatar(Profile profile) {
        if (profile == null || profile.getProfilePicture() == null || profile.getProfilePicture().getId() == null) {
            return null;
        }
        PictureResponse response = new PictureResponse();
        response.setId(profile.getProfilePicture().getId());
        response.setUrl("/media/" + profile.getProfilePicture().getId());
        return response;
    }

}
