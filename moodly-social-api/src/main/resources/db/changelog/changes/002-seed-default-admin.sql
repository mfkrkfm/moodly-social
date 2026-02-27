--liquibase formatted sql

--changeset codex:002-seed-default-admin
--preconditions onFail:MARK_RAN onError:HALT
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM users WHERE username = 'admin' OR email = 'admin@example.com'

SET @admin_profile_id := (SELECT next_val FROM profile_seq LIMIT 1);

INSERT INTO `profile` (`id`) VALUES (@admin_profile_id);

UPDATE `profile_seq`
SET `next_val` = @admin_profile_id + 1;

INSERT INTO `users` (`email`, `password`, `username`, `profile_id`)
--TODO: Change to .env variables
VALUES (
  'admin@example.com',
  '$2y$12$TacDLSNxIvfp59htc3skXO8/vvzJ5BUF6n0ffmPRWKcAjdzL/u94u',
  'admin',
  @admin_profile_id
);

INSERT INTO `user_roles` (`user_id`, `role`)
VALUES (
  (SELECT `user_id` FROM `users` WHERE `username` = 'admin'),
  'ROLE_ADMIN'
);
