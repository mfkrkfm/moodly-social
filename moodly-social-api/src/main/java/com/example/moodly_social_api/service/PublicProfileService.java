package com.example.moodly_social_api.service;

import com.example.moodly_social_api.dto.follow.FollowResponse;
import com.example.moodly_social_api.dto.post.PictureResponse;
import com.example.moodly_social_api.dto.post.PostResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicProfileResponse;
import com.example.moodly_social_api.dto.publicprofile.PublicUserCardResponse;
import com.example.moodly_social_api.entity.Post;
import com.example.moodly_social_api.entity.Profile;
import com.example.moodly_social_api.entity.User;
import com.example.moodly_social_api.exception.CustomException;
import com.example.moodly_social_api.repository.PostRepository;
import com.example.moodly_social_api.repository.UserRepository;
import com.example.moodly_social_api.service.mapper.PostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicProfileService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostMapper postMapper;

    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(String username) {
        Profile profile = findProfileByUsername(username);
        return toPublicProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getUserPosts(String username) {
        findProfileByUsername(username);
        return postRepository.findAllByAuthor_User_UsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(post -> postMapper.toPostResponse(post, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getUserPostById(String username, Long postId) {
        Post post = postRepository.findByIdAndAuthor_User_Username(postId, username)
                .orElseThrow(() -> new CustomException("Post not found", HttpStatus.NOT_FOUND));
        return postMapper.toPostResponse(post, null);
    }

    @Transactional(readOnly = true)
    public List<PublicUserCardResponse> searchUsers(String query) {
        return userRepository.findTop20ByUsernameContainingIgnoreCase(query)
                .stream()
                .filter(user -> user.getProfile() != null)
                .map(user -> toPublicUserCardResponse(user.getProfile()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicUserCardResponse> getFollowers(String username) {
        Profile profile = findProfileByUsername(username);
        return profile.getFollowers()
                .stream()
                .map(this::toPublicUserCardResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicUserCardResponse> getFollowing(String username) {
        Profile profile = findProfileByUsername(username);
        return profile.getFollowing()
                .stream()
                .map(this::toPublicUserCardResponse)
                .toList();
    }

    @Transactional
    public FollowResponse follow(Long currentUserId, String targetUsername) {
        Profile current = getCurrentProfile(currentUserId);
        Profile target = findProfileByUsername(targetUsername);

        if (current.getId().equals(target.getId())) {
            throw new CustomException("You cannot follow yourself", HttpStatus.BAD_REQUEST);
        }

        addFollowRelation(current, target);

        FollowResponse response = new FollowResponse();
        response.setTargetUsername(targetUsername);
        response.setFollowing(true);
        response.setFollowersCount(target.getFollowers().size());
        return response;
    }

    @Transactional
    public FollowResponse unfollow(Long currentUserId, String targetUsername) {
        Profile current = getCurrentProfile(currentUserId);
        Profile target = findProfileByUsername(targetUsername);

        if (current.getId().equals(target.getId())) {
            throw new CustomException("You cannot unfollow yourself", HttpStatus.BAD_REQUEST);
        }

        removeFollowRelation(current, target);

        FollowResponse response = new FollowResponse();
        response.setTargetUsername(targetUsername);
        response.setFollowing(false);
        response.setFollowersCount(target.getFollowers().size());
        return response;
    }

    private Profile getCurrentProfile(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        if (user.getProfile() == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }
        return user.getProfile();
    }

    private Profile findProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        if (user.getProfile() == null) {
            throw new CustomException("Profile not found", HttpStatus.NOT_FOUND);
        }
        return user.getProfile();
    }

    private PublicProfileResponse toPublicProfileResponse(Profile profile) {
        PublicProfileResponse response = new PublicProfileResponse();
        response.setUsername(profile.getUser() != null ? profile.getUser().getUsername() : null);
        response.setAuthorPicture(toPictureResponse(profile));
        response.setFirstName(profile.getFirstName());
        response.setLastName(profile.getLastName());
        response.setBio(profile.getBio());
        response.setMood(profile.getMood());
        response.setFollowersCount(profile.getFollowers().size());
        response.setFollowingCount(profile.getFollowing().size());
        return response;
    }

    private PublicUserCardResponse toPublicUserCardResponse(Profile profile) {
        PublicUserCardResponse response = new PublicUserCardResponse();
        response.setUsername(profile.getUser() != null ? profile.getUser().getUsername() : null);
        response.setName(profile.getFirstName());
        response.setSurname(profile.getLastName());
        response.setAvatarUrl(profile.getProfilePicture() != null ? "/media/" + profile.getProfilePicture().getId() : null);
        return response;
    }

    private PictureResponse toPictureResponse(Profile profile) {
        if (profile.getProfilePicture() == null || profile.getProfilePicture().getId() == null) {
            return null;
        }
        PictureResponse response = new PictureResponse();
        response.setId(profile.getProfilePicture().getId());
        response.setUrl("/media/" + profile.getProfilePicture().getId());
        return response;
    }

    private void addFollowRelation(Profile follower, Profile followed) {
        follower.getFollowing().add(followed);
        followed.getFollowers().add(follower);
    }

    private void removeFollowRelation(Profile follower, Profile followed) {
        follower.getFollowing().remove(followed);
        followed.getFollowers().remove(follower);
    }
}
