--liquibase formatted sql

--changeset codex:001-initial-schema
--preconditions onFail:MARK_RAN onError:HALT
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'

CREATE TABLE `picture` (
  `id` bigint NOT NULL,
  `content` longblob,
  `post_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_picture_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `profile` (
  `id` bigint NOT NULL,
  `bio` text,
  `birth_date` date DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `mood` enum('ANGRY','CALM','HAPPY','SAD','STRESSED') DEFAULT NULL,
  `picture_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_profile_picture_id` (`picture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `profile_id` bigint DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_profile_id` (`profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post` (
  `id` bigint NOT NULL,
  `content` text,
  `created_at` datetime(6) DEFAULT NULL,
  `is_edited` bit(1) NOT NULL,
  `mood` enum('ANGRY','CALM','HAPPY','SAD','STRESSED') DEFAULT NULL,
  `author_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_post_author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `comment` (
  `id` bigint NOT NULL,
  `content` text,
  `created_at` datetime(6) DEFAULT NULL,
  `is_edited` bit(1) NOT NULL,
  `author_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `post_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_comment_author_id` (`author_id`),
  KEY `idx_comment_parent_id` (`parent_id`),
  KEY `idx_comment_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role` enum('ROLE_ADMIN','ROLE_CLIENT') DEFAULT NULL,
  KEY `idx_user_roles_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post_likes` (
  `post_id` bigint NOT NULL,
  `profile_id` bigint NOT NULL,
  PRIMARY KEY (`post_id`,`profile_id`),
  KEY `idx_post_likes_profile_id` (`profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `profile_followers` (
  `follower_id` bigint NOT NULL,
  `followed_id` bigint NOT NULL,
  PRIMARY KEY (`follower_id`,`followed_id`),
  KEY `idx_profile_followers_followed_id` (`followed_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `profile_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `comment_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `picture_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `profile_seq` (`next_val`) VALUES (1);
INSERT INTO `post_seq` (`next_val`) VALUES (1);
INSERT INTO `comment_seq` (`next_val`) VALUES (1);
INSERT INTO `picture_seq` (`next_val`) VALUES (1);

ALTER TABLE `profile`
  ADD CONSTRAINT `fk_profile_picture` FOREIGN KEY (`picture_id`) REFERENCES `picture` (`id`);

ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_profile` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`id`);

ALTER TABLE `post`
  ADD CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `profile` (`id`);

ALTER TABLE `comment`
  ADD CONSTRAINT `fk_comment_author` FOREIGN KEY (`author_id`) REFERENCES `profile` (`id`),
  ADD CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`),
  ADD CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`);

ALTER TABLE `picture`
  ADD CONSTRAINT `fk_picture_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`);

ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `post_likes`
  ADD CONSTRAINT `fk_post_likes_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`),
  ADD CONSTRAINT `fk_post_likes_profile` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`id`);

ALTER TABLE `profile_followers`
  ADD CONSTRAINT `fk_profile_followers_follower` FOREIGN KEY (`follower_id`) REFERENCES `profile` (`id`),
  ADD CONSTRAINT `fk_profile_followers_followed` FOREIGN KEY (`followed_id`) REFERENCES `profile` (`id`);
