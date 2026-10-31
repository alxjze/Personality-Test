-- Psikologia Career — core schema (MySQL 5.7+/8.x, MariaDB 10.4+)
-- All timestamps are stored in UTC.

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    education VARCHAR(150) NULL,
    current_position VARCHAR(150) NULL,
    career_goal TEXT NULL,
    profile_data JSON NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_profiles_user (user_id),
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reflections (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    answers_json JSON NOT NULL,
    result_json JSON NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_reflections_user_created (user_id, created_at),
    CONSTRAINT fk_reflections_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_conversations_user_updated (user_id, updated_at),
    CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversation_messages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT UNSIGNED NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content MEDIUMTEXT NOT NULL,
    meta_json JSON NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_messages_conversation (conversation_id, id),
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cv_reviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NULL,
    original_filename VARCHAR(255) NULL,
    source ENUM('upload', 'paste') NOT NULL DEFAULT 'paste',
    target_job VARCHAR(150) NOT NULL,
    job_description TEXT NULL,
    result_json JSON NOT NULL,
    consent_given TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_cv_reviews_user_created (user_id, created_at),
    CONSTRAINT fk_cv_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    job_position VARCHAR(150) NOT NULL,
    interview_type VARCHAR(30) NOT NULL DEFAULT 'behavioral',
    questions_json JSON NOT NULL,
    answers_json JSON NOT NULL,
    feedback_json JSON NOT NULL,
    meta_json JSON NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_interviews_user_created (user_id, created_at),
    CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS consent_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    accepted_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_consent_user_type (user_id, consent_type),
    CONSTRAINT fk_consent_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_password_resets_token (token_hash),
    KEY idx_password_resets_user (user_id),
    CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(64) NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    payload MEDIUMTEXT NOT NULL,
    last_activity INT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    KEY idx_sessions_user (user_id),
    KEY idx_sessions_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
    rl_key VARCHAR(191) NOT NULL,
    hits INT UNSIGNED NOT NULL,
    reset_at INT UNSIGNED NOT NULL,
    PRIMARY KEY (rl_key),
    KEY idx_rate_limits_reset (reset_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
