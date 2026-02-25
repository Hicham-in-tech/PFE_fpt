-- ============================================================
-- PFE Platform - Full Database Schema
-- Run this in phpMyAdmin or MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS pfe_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pfe_db;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           INT          NOT NULL AUTO_INCREMENT,
  name         VARCHAR(191) NOT NULL,
  email        VARCHAR(191) NOT NULL,
  password     VARCHAR(191) NOT NULL,
  role         ENUM('TEAM_LEADER', 'COORDINATOR', 'SUPER_ADMIN') NOT NULL,
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY users_email_key (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id          INT          NOT NULL AUTO_INCREMENT,
  title       VARCHAR(191) NOT NULL,
  description LONGTEXT,
  created_by  INT          NOT NULL,
  status      ENUM('OPEN', 'ASSIGNED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY projects_created_by_fkey (created_by),
  CONSTRAINT projects_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TEAMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id                  INT          NOT NULL AUTO_INCREMENT,
  team_name           VARCHAR(191) NOT NULL,
  project_name        VARCHAR(191) NOT NULL,
  project_description LONGTEXT,
  project_logo        VARCHAR(191),
  leader_id           INT          NOT NULL,
  coordinator_id      INT,
  project_id          INT,
  status              ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  evaluation_score    DOUBLE,
  created_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY teams_leader_id_key (leader_id),
  KEY teams_coordinator_id_fkey (coordinator_id),
  KEY teams_project_id_fkey (project_id),
  CONSTRAINT teams_leader_id_fkey
    FOREIGN KEY (leader_id) REFERENCES users(id),
  CONSTRAINT teams_coordinator_id_fkey
    FOREIGN KEY (coordinator_id) REFERENCES users(id),
  CONSTRAINT teams_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TEAM MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id            INT          NOT NULL AUTO_INCREMENT,
  team_id       INT          NOT NULL,
  first_name    VARCHAR(191) NOT NULL,
  last_name     VARCHAR(191) NOT NULL,
  cin           VARCHAR(191),
  cne           VARCHAR(191),
  email         VARCHAR(191),
  github_link   VARCHAR(191),
  linkedin_link VARCHAR(191),
  phone_number  VARCHAR(191),

  PRIMARY KEY (id),
  KEY team_members_team_id_fkey (team_id),
  CONSTRAINT team_members_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- OBSERVATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS observations (
  id             INT         NOT NULL AUTO_INCREMENT,
  team_id        INT         NOT NULL,
  coordinator_id INT         NOT NULL,
  message        LONGTEXT    NOT NULL,
  created_at     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY observations_team_id_fkey (team_id),
  KEY observations_coordinator_id_fkey (coordinator_id),
  CONSTRAINT observations_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE CASCADE,
  CONSTRAINT observations_coordinator_id_fkey
    FOREIGN KEY (coordinator_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id         INT         NOT NULL AUTO_INCREMENT,
  team_id    INT         NOT NULL,
  sender_id  INT         NOT NULL,
  message    LONGTEXT    NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY messages_team_id_fkey (team_id),
  KEY messages_sender_id_fkey (sender_id),
  CONSTRAINT messages_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DEFAULT ACCOUNTS (passwords are bcrypt hashed)
-- admin123 / coord123 / leader123
-- ============================================================
INSERT IGNORE INTO users (name, email, password, role) VALUES
(
  'Super Admin',
  'admin@pfe.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCouLZRMmVqhHx0gEEXRZGi',
  'SUPER_ADMIN'
),
(
  'Dr. Coordinator',
  'coordinator@pfe.com',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC7.4F3RWNxdCiVINilG',
  'COORDINATOR'
),
(
  'Team Leader',
  'leader@pfe.com',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC7.4F3RWNxdCiVINilG',
  'TEAM_LEADER'
);
