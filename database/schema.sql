-- ============================================================================
-- DBMS CAPSTONE PROJECT: Job & Internship Management System
-- Database Name: job_internship_db
-- Relational Schema: 3NF Normalized
-- ============================================================================

CREATE DATABASE IF NOT EXISTS job_internship_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE job_internship_db;

-- Drop views if they exist to avoid recreation conflicts
DROP VIEW IF EXISTS vw_placement_analytics;
DROP VIEW IF EXISTS vw_student_application_details;
DROP VIEW IF EXISTS vw_active_opportunities_with_companies;
DROP VIEW IF EXISTS vw_company_recruitment_summary;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS application_status_history;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS opportunity_skills;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS recruiters;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- 1. USERS TABLE
-- Base authentication and user identity table
-- ============================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'recruiter', 'admin') NOT NULL,
    status ENUM('active', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- ============================================================================
-- 2. COMPANIES TABLE
-- Stores corporate entities offering jobs and internships
-- ============================================================================
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(150) NOT NULL,
    logo_url VARCHAR(255),
    contact_email VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_companies_industry (industry),
    INDEX idx_companies_location (location)
) ENGINE=InnoDB;

-- ============================================================================
-- 3. STUDENTS TABLE
-- Student academic profile and credentials (1-to-1 with users)
-- ============================================================================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(25),
    department VARCHAR(80) NOT NULL,
    cgpa DECIMAL(3, 2) NOT NULL CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    graduation_year INT NOT NULL,
    resume_url VARCHAR(255),
    bio TEXT,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_students_dept (department),
    INDEX idx_students_cgpa (cgpa),
    INDEX idx_students_grad_year (graduation_year)
) ENGINE=InnoDB;

-- ============================================================================
-- 4. RECRUITERS TABLE
-- Recruiter representatives linked to a Company (1-to-1 with users, N-to-1 with companies)
-- ============================================================================
CREATE TABLE recruiters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_id INT NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(25),
    designation VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_recruiters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_recruiters_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_recruiters_company (company_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 5. SKILLS TABLE
-- Master catalog of skills
-- ============================================================================
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    category ENUM('Technical', 'Language', 'Framework', 'Database', 'Cloud & DevOps', 'Soft Skill') DEFAULT 'Technical',
    INDEX idx_skills_category (category)
) ENGINE=InnoDB;

-- ============================================================================
-- 6. STUDENT_SKILLS TABLE (Junction Table: M:N relationship)
-- Connects students with their mastered skills & proficiency levels
-- ============================================================================
CREATE TABLE student_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_skill (student_id, skill_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 7. OPPORTUNITIES TABLE
-- Job and Internship postings created by Recruiters
-- ============================================================================
CREATE TABLE opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT NOT NULL,
    company_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    type ENUM('job', 'internship') NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location VARCHAR(120) NOT NULL,
    work_mode ENUM('On-site', 'Remote', 'Hybrid') DEFAULT 'On-site',
    min_cgpa DECIMAL(3, 2) DEFAULT 0.00 CHECK (min_cgpa >= 0.00 AND min_cgpa <= 10.00),
    allowed_graduation_year INT NOT NULL,
    salary_or_stipend VARCHAR(80) NOT NULL,
    openings_count INT DEFAULT 1 CHECK (openings_count > 0),
    deadline DATE NOT NULL,
    status ENUM('pending_approval', 'approved', 'rejected', 'closed') DEFAULT 'pending_approval',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_opp_recruiter FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE,
    CONSTRAINT fk_opp_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_opp_type (type),
    INDEX idx_opp_status (status),
    INDEX idx_opp_deadline (deadline),
    INDEX idx_opp_min_cgpa (min_cgpa),
    INDEX idx_opp_category (category)
) ENGINE=InnoDB;

-- ============================================================================
-- 8. OPPORTUNITY_SKILLS TABLE (Junction Table: M:N relationship)
-- Connects opportunities with required or preferred skills
-- ============================================================================
CREATE TABLE opportunity_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id INT NOT NULL,
    skill_id INT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_os_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_os_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_opportunity_skill (opportunity_id, skill_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 9. APPLICATIONS TABLE
-- Stores student applications for opportunities with status workflow
-- ============================================================================
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected') DEFAULT 'Applied',
    cover_letter TEXT,
    resume_url VARCHAR(255),
    match_score INT DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_app_opp_student (opportunity_id, student_id),
    INDEX idx_app_status (status),
    INDEX idx_app_applied_at (applied_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 10. APPLICATION_STATUS_HISTORY TABLE
-- Audit trail tracking every stage change of a student application
-- ============================================================================
CREATE TABLE application_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected') NOT NULL,
    remarks TEXT,
    changed_by_user_id INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ash_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_ash_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ash_app (application_id),
    INDEX idx_ash_status (status)
) ENGINE=InnoDB;

-- ============================================================================
-- 11. NOTIFICATIONS TABLE
-- Real-time notification logs for students, recruiters, and admins
-- ============================================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('application_status', 'job_alert', 'approval', 'system') DEFAULT 'application_status',
    reference_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- ============================================================================
-- DATABASE VIEWS (Demonstrating DBMS Views Concept)
-- ============================================================================

-- View 1: Active Approved Opportunities with Company Details and Application Counts
CREATE VIEW vw_active_opportunities_with_companies AS
SELECT 
    o.id AS opportunity_id,
    o.title,
    o.type,
    o.category,
    o.description,
    o.requirements,
    o.location,
    o.work_mode,
    o.min_cgpa,
    o.allowed_graduation_year,
    o.salary_or_stipend,
    o.openings_count,
    o.deadline,
    o.status,
    o.created_at,
    c.id AS company_id,
    c.name AS company_name,
    c.logo_url AS company_logo,
    c.website AS company_website,
    c.industry AS company_industry,
    r.id AS recruiter_id,
    r.full_name AS recruiter_name,
    COUNT(a.id) AS total_applications
FROM opportunities o
INNER JOIN companies c ON o.company_id = c.id
INNER JOIN recruiters r ON o.recruiter_id = r.id
LEFT JOIN applications a ON o.id = a.opportunity_id
WHERE o.status = 'approved' AND o.deadline >= CURRENT_DATE()
GROUP BY o.id, c.id, r.id;

-- View 2: Complete Student Application Details with Opportunity & Company Data
CREATE VIEW vw_student_application_details AS
SELECT 
    a.id AS application_id,
    a.status AS application_status,
    a.match_score,
    a.cover_letter,
    a.resume_url AS application_resume,
    a.applied_at,
    a.updated_at AS last_updated_at,
    s.id AS student_id,
    s.full_name AS student_name,
    s.roll_number,
    s.department,
    s.cgpa,
    s.graduation_year,
    u.email AS student_email,
    o.id AS opportunity_id,
    o.title AS opportunity_title,
    o.type AS opportunity_type,
    o.salary_or_stipend,
    o.location AS opportunity_location,
    o.work_mode,
    o.deadline,
    c.id AS company_id,
    c.name AS company_name,
    c.logo_url AS company_logo
FROM applications a
INNER JOIN students s ON a.student_id = s.id
INNER JOIN users u ON s.user_id = u.id
INNER JOIN opportunities o ON a.opportunity_id = o.id
INNER JOIN companies c ON o.company_id = c.id;

-- View 3: Placement Analytics View by Department
CREATE VIEW vw_placement_analytics AS
SELECT 
    s.department,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.id END) AS placed_students,
    ROUND(
        (COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.id END) * 100.0) / 
        NULLIF(COUNT(DISTINCT s.id), 0), 2
    ) AS placement_percentage,
    ROUND(AVG(s.cgpa), 2) AS average_cgpa
FROM students s
LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.department;

-- View 4: Company Recruitment Summary
CREATE VIEW vw_company_recruitment_summary AS
SELECT 
    c.id AS company_id,
    c.name AS company_name,
    c.industry,
    COUNT(DISTINCT o.id) AS total_opportunities_posted,
    COUNT(DISTINCT a.id) AS total_applications_received,
    COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.id END) AS total_hires
FROM companies c
LEFT JOIN opportunities o ON c.id = o.company_id
LEFT JOIN applications a ON o.id = a.opportunity_id
GROUP BY c.id;
