-- ============================================================================
-- DBMS CAPSTONE PROJECT: Stored Procedures
-- Demonstrates Stored Procedures, Error Handling, Transactions & Business Logic
-- ============================================================================

USE job_internship_db;

DELIMITER $$

-- ============================================================================
-- PROCEDURE 1: sp_calculate_skill_match
-- Calculates matching percentage between a student's skills and opportunity requirements
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_calculate_skill_match$$
CREATE PROCEDURE sp_calculate_skill_match(
    IN p_student_id INT,
    IN p_opportunity_id INT,
    OUT p_match_percentage INT
)
BEGIN
    DECLARE v_required_skills_count INT DEFAULT 0;
    DECLARE v_matched_skills_count INT DEFAULT 0;

    -- Count total required skills for the opportunity
    SELECT COUNT(*) INTO v_required_skills_count
    FROM opportunity_skills
    WHERE opportunity_id = p_opportunity_id;

    -- If no skills are explicitly required, default match is 100%
    IF v_required_skills_count = 0 THEN
        SET p_match_percentage = 100;
    ELSE
        -- Count matching skills using INNER JOIN between student skills and opportunity skills
        SELECT COUNT(*) INTO v_matched_skills_count
        FROM student_skills ss
        INNER JOIN opportunity_skills os ON ss.skill_id = os.skill_id
        WHERE ss.student_id = p_student_id 
          AND os.opportunity_id = p_opportunity_id;

        SET p_match_percentage = ROUND((v_matched_skills_count * 100.0) / v_required_skills_count);
        IF p_match_percentage > 100 THEN
            SET p_match_percentage = 100;
        END IF;
    END IF;
END$$

-- ============================================================================
-- PROCEDURE 2: sp_apply_for_opportunity
-- Full Transactional Application Submission with Eligibility & Duplication Checks
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_apply_for_opportunity$$
CREATE PROCEDURE sp_apply_for_opportunity(
    IN p_student_id INT,
    IN p_opportunity_id INT,
    IN p_cover_letter TEXT,
    IN p_resume_url VARCHAR(255),
    OUT p_application_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_block: BEGIN
    DECLARE v_opp_status VARCHAR(50);
    DECLARE v_deadline DATE;
    DECLARE v_min_cgpa DECIMAL(3, 2);
    DECLARE v_allowed_grad_year INT;
    DECLARE v_student_cgpa DECIMAL(3, 2);
    DECLARE v_student_grad_year INT;
    DECLARE v_already_applied INT DEFAULT 0;
    DECLARE v_match_score INT DEFAULT 0;

    -- Declare exception handler to rollback on SQL errors
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_application_id = NULL;
        SET p_status_code = 500;
        SET p_status_message = 'Internal database error during application processing.';
    END;

    -- 1. Check Opportunity existence and approval status
    SELECT status, deadline, min_cgpa, allowed_graduation_year 
    INTO v_opp_status, v_deadline, v_min_cgpa, v_allowed_grad_year
    FROM opportunities
    WHERE id = p_opportunity_id;

    IF v_opp_status IS NULL THEN
        SET p_status_code = 404;
        SET p_status_message = 'Opportunity not found.';
        LEAVE proc_block;
    END IF;

    IF v_opp_status != 'approved' THEN
        SET p_status_code = 400;
        SET p_status_message = 'Cannot apply: Opportunity is not open or approved.';
        LEAVE proc_block;
    END IF;

    -- 2. Check Deadline
    IF v_deadline < CURRENT_DATE() THEN
        SET p_status_code = 400;
        SET p_status_message = 'Application deadline has expired.';
        LEAVE proc_block;
    END IF;

    -- 3. Check Student details and Eligibility
    SELECT cgpa, graduation_year 
    INTO v_student_cgpa, v_student_grad_year
    FROM students
    WHERE id = p_student_id;

    IF v_student_cgpa IS NULL THEN
        SET p_status_code = 404;
        SET p_status_message = 'Student profile not found.';
        LEAVE proc_block;
    END IF;

    -- Eligibility check: CGPA
    IF v_student_cgpa < v_min_cgpa THEN
        SET p_status_code = 403;
        SET p_status_message = CONCAT('Eligibility failure: Minimum CGPA required is ', v_min_cgpa, ', your CGPA is ', v_student_cgpa);
        LEAVE proc_block;
    END IF;

    -- Eligibility check: Graduation Year (if specified)
    IF v_allowed_grad_year > 0 AND v_student_grad_year != v_allowed_grad_year THEN
        SET p_status_code = 403;
        SET p_status_message = CONCAT('Eligibility failure: Opportunity is reserved for ', v_allowed_grad_year, ' batch.');
        LEAVE proc_block;
    END IF;

    -- 4. Check Duplicate Application
    SELECT COUNT(*) INTO v_already_applied
    FROM applications
    WHERE opportunity_id = p_opportunity_id AND student_id = p_student_id;

    IF v_already_applied > 0 THEN
        SET p_status_code = 409;
        SET p_status_message = 'You have already applied for this opportunity.';
        LEAVE proc_block;
    END IF;

    -- 5. Calculate Smart Skill Match Score
    CALL sp_calculate_skill_match(p_student_id, p_opportunity_id, v_match_score);

    -- 6. Execute Transaction
    START TRANSACTION;

    INSERT INTO applications (
        opportunity_id,
        student_id,
        status,
        cover_letter,
        resume_url,
        match_score
    ) VALUES (
        p_opportunity_id,
        p_student_id,
        'Applied',
        p_cover_letter,
        p_resume_url,
        v_match_score
    );

    SET p_application_id = LAST_INSERT_ID();

    COMMIT;

    SET p_status_code = 201;
    SET p_status_message = 'Application submitted successfully!';
END$$

-- ============================================================================
-- PROCEDURE 3: sp_update_application_status
-- Updates candidate status with custom recruiter remarks and audit logging
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_update_application_status$$
CREATE PROCEDURE sp_update_application_status(
    IN p_application_id INT,
    IN p_new_status VARCHAR(50),
    IN p_remarks TEXT,
    IN p_user_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
proc_block: BEGIN
    DECLARE v_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = 'Database error updating status.';
    END;

    SELECT COUNT(*) INTO v_exists FROM applications WHERE id = p_application_id;

    IF v_exists = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Application record not found.';
        LEAVE proc_block;
    END IF;

    START TRANSACTION;

    -- Update application status
    UPDATE applications
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_application_id;

    -- Update or add remark in history
    INSERT INTO application_status_history (
        application_id,
        status,
        remarks,
        changed_by_user_id
    ) VALUES (
        p_application_id,
        p_new_status,
        p_remarks,
        p_user_id
    );

    COMMIT;

    SET p_success = TRUE;
    SET p_message = CONCAT('Application status successfully updated to ', p_new_status);
END$$

-- ============================================================================
-- PROCEDURE 4: sp_get_admin_dashboard_stats
-- Aggregate analytics and metrics for Placement Admin Dashboard
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_get_admin_dashboard_stats$$
CREATE PROCEDURE sp_get_admin_dashboard_stats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM companies) AS total_companies,
        (SELECT COUNT(*) FROM opportunities WHERE status = 'approved') AS total_active_opportunities,
        (SELECT COUNT(*) FROM opportunities WHERE status = 'pending_approval') AS total_pending_approvals,
        (SELECT COUNT(*) FROM applications) AS total_applications,
        (SELECT COUNT(DISTINCT student_id) FROM applications WHERE status = 'Selected') AS total_placed_students,
        (SELECT ROUND(AVG(cgpa), 2) FROM students) AS campus_average_cgpa;
END$$

DELIMITER ;
