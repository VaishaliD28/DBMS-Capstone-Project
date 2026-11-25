-- ============================================================================
-- DBMS CAPSTONE PROJECT: Comprehensive SQL Queries Demonstrating Core Concepts
-- Database Name: job_internship_db
-- ============================================================================

USE job_internship_db;

-- ============================================================================
-- 1. SQL JOIN OPERATIONS
-- ============================================================================

-- Query 1.1: INNER JOIN - Retrieve Active Job Postings with Company & Recruiter Details
SELECT 
    o.id AS opportunity_id,
    o.title,
    o.type,
    c.name AS company_name,
    c.location AS company_location,
    r.full_name AS posted_by,
    o.salary_or_stipend,
    o.deadline
FROM opportunities o
INNER JOIN companies c ON o.company_id = c.id
INNER JOIN recruiters r ON o.recruiter_id = r.id
WHERE o.status = 'approved'
ORDER BY o.deadline ASC;

-- Query 1.2: LEFT JOIN - All Students and Their Total Applications Submitted
-- (Shows students even if they have submitted 0 applications)
SELECT 
    s.roll_number,
    s.full_name,
    s.department,
    s.cgpa,
    COUNT(a.id) AS total_applications_submitted
FROM students s
LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.id, s.roll_number, s.full_name, s.department, s.cgpa
ORDER BY total_applications_submitted DESC;

-- Query 1.3: Multi-Table JOIN (5 Tables) - Comprehensive Candidate Selection Report
SELECT 
    a.id AS application_id,
    s.full_name AS student_name,
    s.roll_number,
    s.department,
    c.name AS company_name,
    o.title AS job_title,
    o.type,
    o.salary_or_stipend,
    a.match_score,
    a.status AS final_status,
    a.applied_at
FROM applications a
INNER JOIN students s ON a.student_id = s.id
INNER JOIN opportunities o ON a.opportunity_id = o.id
INNER JOIN companies c ON o.company_id = c.id
WHERE a.status = 'Selected'
ORDER BY s.department, c.name;

-- ============================================================================
-- 2. GROUP BY AND HAVING CLAUSES
-- ============================================================================

-- Query 2.1: Companies with more than 1 Opportunity Posting
SELECT 
    c.name AS company_name,
    c.industry,
    COUNT(o.id) AS total_opportunities_posted,
    COUNT(DISTINCT a.id) AS total_applicants_received
FROM companies c
INNER JOIN opportunities o ON c.id = o.company_id
LEFT JOIN applications a ON o.id = a.opportunity_id
GROUP BY c.id, c.name, c.industry
HAVING COUNT(o.id) >= 2
ORDER BY total_applicants_received DESC;

-- Query 2.2: Departments with an Average CGPA of 8.5 or higher and at least 3 students
SELECT 
    department,
    COUNT(id) AS student_count,
    ROUND(AVG(cgpa), 2) AS average_cgpa,
    MAX(cgpa) AS highest_cgpa,
    MIN(cgpa) AS lowest_cgpa
FROM students
GROUP BY department
HAVING AVG(cgpa) >= 8.5 AND COUNT(id) >= 3
ORDER BY average_cgpa DESC;

-- ============================================================================
-- 3. AGGREGATE FUNCTIONS (COUNT, AVG, MIN, MAX, SUM)
-- ============================================================================

-- Query 3.1: Placement Overview Statistics
SELECT 
    COUNT(DISTINCT s.id) AS total_registered_students,
    COUNT(DISTINCT o.id) AS total_job_opportunities,
    COUNT(a.id) AS total_applications_processed,
    COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.student_id END) AS unique_students_placed,
    ROUND(
        (COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.student_id END) * 100.0) / 
        COUNT(DISTINCT s.id), 2
    ) AS overall_placement_rate_pct,
    ROUND(AVG(s.cgpa), 2) AS overall_average_cgpa
FROM students s
LEFT JOIN applications a ON s.id = a.student_id
LEFT JOIN opportunities o ON a.opportunity_id = o.id;

-- ============================================================================
-- 4. SUBQUERIES AND CORRELATED SUBQUERIES
-- ============================================================================

-- Query 4.1: Single-Row Subquery - Students whose CGPA is higher than the campus average
SELECT 
    roll_number,
    full_name,
    department,
    cgpa
FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students)
ORDER BY cgpa DESC;

-- Query 4.2: Multiple-Row Subquery (IN) - Companies that have accepted at least one candidate
SELECT 
    id,
    name,
    industry,
    location,
    contact_email
FROM companies
WHERE id IN (
    SELECT DISTINCT o.company_id
    FROM opportunities o
    INNER JOIN applications a ON o.id = a.opportunity_id
    WHERE a.status = 'Selected'
);

-- Query 4.3: Correlated Subquery - For each student, find their highest match score application
SELECT 
    s.roll_number,
    s.full_name,
    s.department,
    (
        SELECT MAX(a.match_score)
        FROM applications a
        WHERE a.student_id = s.id
    ) AS highest_skill_match_pct
FROM students s
WHERE EXISTS (
    SELECT 1 FROM applications a WHERE a.student_id = s.id
)
ORDER BY highest_skill_match_pct DESC;

-- ============================================================================
-- 5. SKILL MATCHING SET OPERATIONS / JUNCTIONS
-- ============================================================================

-- Query 5.1: Calculate Matching vs Missing Skills for Student 1 and Opportunity 1 (Google SWE)
SELECT 
    sk.id AS skill_id,
    sk.name AS skill_name,
    sk.category,
    os.is_required,
    CASE 
        WHEN ss.student_id IS NOT NULL THEN 'MATCHED'
        ELSE 'MISSING'
    END AS match_status,
    ss.proficiency AS student_proficiency
FROM opportunity_skills os
INNER JOIN skills sk ON os.skill_id = sk.id
LEFT JOIN student_skills ss ON os.skill_id = ss.skill_id AND ss.student_id = 1
WHERE os.opportunity_id = 1
ORDER BY match_status DESC, sk.name ASC;

-- ============================================================================
-- 6. TOP IN-DEMAND SKILLS IN CAMPUS PLACEMENT
-- ============================================================================

SELECT 
    sk.name AS skill_name,
    sk.category,
    COUNT(os.opportunity_id) AS demanded_by_opportunities_count,
    COUNT(ss.student_id) AS possessed_by_students_count
FROM skills sk
LEFT JOIN opportunity_skills os ON sk.id = os.skill_id
LEFT JOIN student_skills ss ON sk.id = ss.skill_id
GROUP BY sk.id, sk.name, sk.category
ORDER BY demanded_by_opportunities_count DESC, possessed_by_students_count DESC
LIMIT 10;

-- ============================================================================
-- 7. DATABASE VIEWS DEMONSTRATION
-- ============================================================================

-- Query 7.1: Querying the Pre-compiled Active Opportunities View
SELECT * FROM vw_active_opportunities_with_companies;

-- Query 7.2: Querying the Placement Analytics View
SELECT * FROM vw_placement_analytics;

-- Query 7.3: Querying the Student Application Details View
SELECT 
    student_name,
    department,
    company_name,
    opportunity_title,
    application_status,
    match_score
FROM vw_student_application_details
WHERE application_status IN ('Shortlisted', 'Interview', 'Selected');

-- ============================================================================
-- 8. TRANSACTION DEMONSTRATION
-- ============================================================================

-- Demonstration of an ACID Transaction updating an application and logging history
START TRANSACTION;

-- Step 1: Update Application Status
UPDATE applications 
SET status = 'Interview', updated_at = NOW() 
WHERE id = 3;

-- Step 2: Insert into Application Status History audit trail
INSERT INTO application_status_history (
    application_id, 
    status, 
    remarks, 
    changed_by_user_id
) VALUES (
    3, 
    'Interview', 
    'Candidate qualified technical screening. Round 1 Interview scheduled.', 
    3
);

-- Step 3: Insert Notification for the student
INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    reference_id
) VALUES (
    (SELECT user_id FROM students WHERE id = (SELECT student_id FROM applications WHERE id = 3)),
    'Interview Invitation: Azure Distributed Systems Engineer',
    'You have been invited for a Technical Interview for Azure Systems Engineer at Microsoft IDC.',
    'application_status',
    3
);

-- Step 4: Commit all changes atomically
COMMIT;
