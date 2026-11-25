-- ============================================================================
-- DBMS CAPSTONE PROJECT: Stored Triggers
-- Demonstrates active database rules and audit trails in MySQL
-- ============================================================================

USE job_internship_db;

DELIMITER $$

-- ============================================================================
-- TRIGGER 1: trg_before_application_insert
-- Enforces business rules: Checks if opportunity is approved and deadline has not passed
-- ============================================================================
DROP TRIGGER IF EXISTS trg_before_application_insert$$
CREATE TRIGGER trg_before_application_insert
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(50);
    DECLARE v_deadline DATE;

    SELECT status, deadline INTO v_status, v_deadline
    FROM opportunities
    WHERE id = NEW.opportunity_id;

    IF v_status != 'approved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Application Error: Cannot apply to an opportunity that is not approved.';
    END IF;

    IF v_deadline < CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Application Error: The application deadline for this opportunity has expired.';
    END IF;
END$$

-- ============================================================================
-- TRIGGER 2: trg_after_application_insert
-- Automatically initializes Application Status History audit trail and Notification
-- ============================================================================
DROP TRIGGER IF EXISTS trg_after_application_insert$$
CREATE TRIGGER trg_after_application_insert
AFTER INSERT ON applications
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_opp_title VARCHAR(150);

    -- Find student's user_id
    SELECT user_id INTO v_user_id FROM students WHERE id = NEW.student_id;

    -- Find opportunity title
    SELECT title INTO v_opp_title FROM opportunities WHERE id = NEW.opportunity_id;

    -- 1. Insert Initial Status History Record
    INSERT INTO application_status_history (
        application_id, 
        status, 
        remarks, 
        changed_by_user_id
    ) VALUES (
        NEW.id, 
        NEW.status, 
        'Application submitted successfully by student.', 
        v_user_id
    );

    -- 2. Insert In-app Notification for the Student
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        reference_id
    ) VALUES (
        v_user_id,
        CONCAT('Application Submitted: ', v_opp_title),
        CONCAT('Your application for "', v_opp_title, '" has been recorded with status: ', NEW.status),
        'application_status',
        NEW.id
    );
END$$

-- ============================================================================
-- TRIGGER 3: trg_after_application_status_update
-- Automatically tracks status transitions and notifies the student
-- ============================================================================
DROP TRIGGER IF EXISTS trg_after_application_status_update$$
CREATE TRIGGER trg_after_application_status_update
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_opp_title VARCHAR(150);
    DECLARE v_notif_title VARCHAR(150);
    DECLARE v_notif_msg TEXT;

    -- Only react if status has changed
    IF OLD.status != NEW.status THEN
        -- Find student's user_id
        SELECT user_id INTO v_user_id FROM students WHERE id = NEW.student_id;

        -- Find opportunity title
        SELECT title INTO v_opp_title FROM opportunities WHERE id = NEW.opportunity_id;

        -- 1. Audit trail in history table
        INSERT INTO application_status_history (
            application_id,
            status,
            remarks,
            changed_by_user_id
        ) VALUES (
            NEW.id,
            NEW.status,
            CONCAT('Status updated from ', OLD.status, ' to ', NEW.status),
            NULL
        );

        -- 2. Craft tailored notification message based on new status
        SET v_notif_title = CONCAT('Status Update: ', v_opp_title);
        
        IF NEW.status = 'Under Review' THEN
            SET v_notif_msg = CONCAT('Your application for "', v_opp_title, '" is now under review by the recruitment team.');
        ELSEIF NEW.status = 'Shortlisted' THEN
            SET v_notif_msg = CONCAT('Congratulations! You have been Shortlisted for "', v_opp_title, '".');
        ELSEIF NEW.status = 'Interview' THEN
            SET v_notif_msg = CONCAT('Interview Alert: You have been selected for an interview for "', v_opp_title, '". Please check your email for the schedule.');
        ELSEIF NEW.status = 'Selected' THEN
            SET v_notif_msg = CONCAT('Offer Letter Alert! Congratulations, you have been Selected for "', v_opp_title, '"!');
        ELSEIF NEW.status = 'Rejected' THEN
            SET v_notif_msg = CONCAT('Update regarding your application for "', v_opp_title, '": You were not shortlisted this time. Keep applying!');
        ELSE
            SET v_notif_msg = CONCAT('Your application status for "', v_opp_title, '" changed to ', NEW.status);
        END IF;

        -- 3. Insert notification
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            reference_id
        ) VALUES (
            v_user_id,
            v_notif_title,
            v_notif_msg,
            'application_status',
            NEW.id
        );
    END IF;
END$$

DELIMITER ;
