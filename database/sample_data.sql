-- ============================================================================
-- DBMS CAPSTONE PROJECT: Comprehensive Sample Data
-- Database: job_internship_db
-- Includes: 1 Admin, 6 Companies, 6 Recruiters, 16 Students, 25 Skills,
--           12 Opportunities, 28 Applications, History & Notifications
-- Passwords:
--   Admin:     admin123     (or any password when using demo auto-login)
--   Recruiter: recruiter123
--   Student:   student123
-- ============================================================================

USE job_internship_db;

-- Standard Bcrypt Hash for 'student123', 'recruiter123', 'admin123'
-- Hash: $2a$10$wT5g80nO5D4r4zMlmxWpdugI5O5mS1ZgL7qW1Yq9gP9x0j9k8l7ma (or verified at runtime)
SET @admin_pass = '$2a$10$eE6/MszV5VdE.CekD11q3OWf8N1dO.3K/8wTsm5r2yM4aU9b7I6oK';
SET @recruiter_pass = '$2a$10$eE6/MszV5VdE.CekD11q3OWf8N1dO.3K/8wTsm5r2yM4aU9b7I6oK';
SET @student_pass = '$2a$10$eE6/MszV5VdE.CekD11q3OWf8N1dO.3K/8wTsm5r2yM4aU9b7I6oK';

-- ----------------------------------------------------------------------------
-- 1. INSERT SKILLS CATALOG (25 Diverse Skills)
-- ----------------------------------------------------------------------------
INSERT INTO skills (id, name, category) VALUES
(1, 'JavaScript', 'Language'),
(2, 'TypeScript', 'Language'),
(3, 'Python', 'Language'),
(4, 'Java', 'Language'),
(5, 'C++', 'Language'),
(6, 'React.js', 'Framework'),
(7, 'Node.js', 'Framework'),
(8, 'Express.js', 'Framework'),
(9, 'Django', 'Framework'),
(10, 'Spring Boot', 'Framework'),
(11, 'Next.js', 'Framework'),
(12, 'MySQL', 'Database'),
(13, 'PostgreSQL', 'Database'),
(14, 'MongoDB', 'Database'),
(15, 'Redis', 'Database'),
(16, 'AWS Cloud', 'Cloud & DevOps'),
(17, 'Docker', 'Cloud & DevOps'),
(18, 'Kubernetes', 'Cloud & DevOps'),
(19, 'CI/CD Pipelines', 'Cloud & DevOps'),
(20, 'Machine Learning', 'Technical'),
(21, 'Data Structures & Algorithms', 'Technical'),
(22, 'RESTful APIs', 'Technical'),
(23, 'Cybersecurity Fundamentals', 'Technical'),
(24, 'UI/UX Design & Figma', 'Technical'),
(25, 'Agile & Team Communication', 'Soft Skill')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 2. INSERT ADMIN USER
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, status) VALUES
(1, 'admin@placement.edu', @admin_pass, 'admin', 'active');

-- ----------------------------------------------------------------------------
-- 3. INSERT COMPANIES (6 Premier Organizations)
-- ----------------------------------------------------------------------------
INSERT INTO companies (id, name, website, industry, description, location, logo_url, contact_email) VALUES
(1, 'Google India', 'https://about.google', 'Information Technology & Cloud', 'Global technology leader specializing in search engine, cloud computing, artificial intelligence and consumer hardware.', 'Bangalore, Karnataka', 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150', 'campus-india@google.com'),
(2, 'Microsoft IDC', 'https://careers.microsoft.com', 'Enterprise Software & Cloud Platforms', 'Empowering every person and organization on the planet to achieve more through Azure, Office, and Surface innovations.', 'Hyderabad, Telangana', 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=150', 'university-recruiting@microsoft.com'),
(3, 'Amazon Web Services', 'https://amazon.jobs', 'E-Commerce & Cloud Infrastructure', 'Earth\'s most customer-centric company and pioneer in cloud computing, e-commerce, digital streaming, and artificial intelligence.', 'Bangalore, Karnataka', 'https://images.unsplash.com/photo-1523474253246-72dc9c3d095d?w=150', 'aws-earlycareers@amazon.com'),
(4, 'Deloitte USI', 'https://deloitte.com', 'Management Consulting & Risk Advisory', 'Deloitte provides audit, consulting, financial advisory, risk management, tax and related services to select clients.', 'Gurgaon, Haryana', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150', 'deloitte-campus@deloitte.com'),
(5, 'Infosys Technologies', 'https://infosys.com', 'IT Services & Digital Transformation', 'A global leader in next-generation digital services and consulting, enabling clients across 56 countries.', 'Bangalore, Karnataka', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150', 'freshers-hiring@infosys.com'),
(6, 'Tata Consultancy Services', 'https://tcs.com', 'Global IT & Business Solutions', 'TCS is an IT services, consulting and business solutions organization that has partnered with large businesses for 50+ years.', 'Mumbai, Maharashtra', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150', 'campus.connect@tcs.com');

-- ----------------------------------------------------------------------------
-- 4. INSERT RECRUITER USERS & PROFILES (Users 2 to 7)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, status) VALUES
(2, 'recruiter.google@placement.edu', @recruiter_pass, 'recruiter', 'active'),
(3, 'recruiter.microsoft@placement.edu', @recruiter_pass, 'recruiter', 'active'),
(4, 'recruiter.amazon@placement.edu', @recruiter_pass, 'recruiter', 'active'),
(5, 'recruiter.deloitte@placement.edu', @recruiter_pass, 'recruiter', 'active'),
(6, 'recruiter.infosys@placement.edu', @recruiter_pass, 'recruiter', 'active'),
(7, 'recruiter.tcs@placement.edu', @recruiter_pass, 'recruiter', 'active');

INSERT INTO recruiters (id, user_id, company_id, full_name, phone, designation) VALUES
(1, 2, 1, 'Sarah Jenkins', '+91 9811223344', 'Lead University Talent Partner'),
(2, 3, 2, 'Vikram Malhotra', '+91 9822334455', 'Principal Campus Recruiter'),
(3, 4, 3, 'David Thorne', '+91 9833445566', 'Senior Tech Talent Specialist'),
(4, 5, 4, 'Meera Nair', '+91 9844556677', 'Director of University Relations'),
(5, 6, 5, 'Rohan Deshmukh', '+91 9855667788', 'Regional Hiring Manager'),
(6, 7, 6, 'Kavita Sundaram', '+91 9866778899', 'Head of Early Career Programs');

-- ----------------------------------------------------------------------------
-- 5. INSERT STUDENT USERS & PROFILES (Users 8 to 23, 16 Students)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, status) VALUES
(8, 'aarav.sharma@student.edu', @student_pass, 'student', 'active'),
(9, 'ananya.iyer@student.edu', @student_pass, 'student', 'active'),
(10, 'rohit.verma@student.edu', @student_pass, 'student', 'active'),
(11, 'diya.patel@student.edu', @student_pass, 'student', 'active'),
(12, 'karthik.rajan@student.edu', @student_pass, 'student', 'active'),
(13, 'sneha.reddy@student.edu', @student_pass, 'student', 'active'),
(14, 'arjun.mehta@student.edu', @student_pass, 'student', 'active'),
(15, 'pooja.hegde@student.edu', @student_pass, 'student', 'active'),
(16, 'varun.singh@student.edu', @student_pass, 'student', 'active'),
(17, 'tanya.chopra@student.edu', @student_pass, 'student', 'active'),
(18, 'neeraj.pandey@student.edu', @student_pass, 'student', 'active'),
(19, 'riya.sen@student.edu', @student_pass, 'student', 'active'),
(20, 'aditya.joshi@student.edu', @student_pass, 'student', 'active'),
(21, 'meghna.krishnan@student.edu', @student_pass, 'student', 'active'),
(22, 'siddharth.nair@student.edu', @student_pass, 'student', 'active'),
(23, 'kavya.bose@student.edu', @student_pass, 'student', 'active');

INSERT INTO students (id, user_id, full_name, roll_number, phone, department, cgpa, graduation_year, resume_url, bio, profile_picture) VALUES
(1, 8, 'Aarav Sharma', '21CSE001', '+91 9100010001', 'Computer Science and Engineering', 9.45, 2025, '/uploads/sample-resume.pdf', 'Passionate full-stack developer and open source enthusiast with expertise in React, Node, and Cloud infrastructure.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 9, 'Ananya Iyer', '21CSE042', '+91 9100010002', 'Computer Science and Engineering', 9.80, 2025, '/uploads/sample-resume.pdf', 'Algorithm design enthusiast, competitive programmer with 5-star rating on CodeChef. Interested in distributed systems.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
(3, 10, 'Rohit Verma', '21IT015', '+91 9100010003', 'Information Technology', 8.65, 2025, '/uploads/sample-resume.pdf', 'Back-end engineer focused on microservices architecture, MySQL performance tuning, and Redis caching.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(4, 11, 'Diya Patel', '21IT028', '+91 9100010004', 'Information Technology', 9.12, 2025, '/uploads/sample-resume.pdf', 'Data science and ML researcher with published paper on computer vision. Proficient in Python, TensorFlow and SQL.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(5, 12, 'Karthik Rajan', '21ECE011', '+91 9100010005', 'Electronics and Communication', 8.20, 2025, '/uploads/sample-resume.pdf', 'Embedded systems enthusiast pivoting to IoT and cloud platforms. Strong foundation in C++ and Python.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(6, 13, 'Sneha Reddy', '21CSE089', '+91 9100010006', 'Computer Science and Engineering', 8.95, 2025, '/uploads/sample-resume.pdf', 'Frontend architect obsessed with UI/UX perfection, accessibility, and high performance web applications.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
(7, 14, 'Arjun Mehta', '22CSE019', '+91 9100010007', 'Computer Science and Engineering', 8.75, 2026, '/uploads/sample-resume.pdf', 'Pre-final year student looking for summer software internships. Active hackathon winner and DevOps learner.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
(8, 15, 'Pooja Hegde', '22IT033', '+91 9100010008', 'Information Technology', 9.30, 2026, '/uploads/sample-resume.pdf', 'Aspiring product manager and cloud developer with deep love for database modeling and user centered design.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
(9, 16, 'Varun Singh', '20CSE102', '+91 9100010009', 'Computer Science and Engineering', 7.80, 2024, '/uploads/sample-resume.pdf', 'Systems developer skilled in Linux internals, Docker containers, and database administration.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
(10, 17, 'Tanya Chopra', '21ECE054', '+91 9100010010', 'Electronics and Communication', 8.40, 2025, '/uploads/sample-resume.pdf', 'Data analyst with solid SQL and Tableau expertise. Skilled in translating data to strategic business insights.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150'),
(11, 18, 'Neeraj Pandey', '21MECH008', '+91 9100010011', 'Mechanical Engineering', 7.90, 2025, '/uploads/sample-resume.pdf', 'Robotics and automation enthusiast combining CAD simulations with Python algorithms and IoT sensors.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
(12, 19, 'Riya Sen', '21CSE110', '+91 9100010012', 'Computer Science and Engineering', 9.60, 2025, '/uploads/sample-resume.pdf', 'Full stack cloud engineer. Built serverless backends and real-time collaboration tools used by 5000+ users.', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150'),
(13, 20, 'Aditya Joshi', '22ECE024', '+91 9100010013', 'Electronics and Communication', 8.10, 2026, '/uploads/sample-resume.pdf', 'Curious builder focused on cyber security, network defense, and ethical hacking certifications.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'),
(14, 21, 'Meghna Krishnan', '21IT072', '+91 9100010014', 'Information Technology', 9.05, 2025, '/uploads/sample-resume.pdf', 'Specialized in microservices, RESTful API design, and distributed caching with Redis and PostgreSQL.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150'),
(15, 22, 'Siddharth Nair', '21CIVIL004', '+91 9100010015', 'Civil Engineering', 7.45, 2025, '/uploads/sample-resume.pdf', 'Smart infrastructure analyst keen on applying Python GIS mapping, SQL databases, and environmental analytics.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'),
(16, 23, 'Kavya Bose', '21CSE134', '+91 9100010016', 'Computer Science and Engineering', 9.25, 2025, '/uploads/sample-resume.pdf', 'Machine Learning practitioner. Proficient in PyTorch, computer vision models, and end-to-end MLOps pipelines.', 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150');

-- ----------------------------------------------------------------------------
-- 6. INSERT STUDENT_SKILLS MAPPINGS
-- ----------------------------------------------------------------------------
INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES
-- Aarav Sharma (Full Stack + Cloud)
(1, 1, 'Advanced'), (1, 6, 'Advanced'), (1, 7, 'Advanced'), (1, 8, 'Advanced'), (1, 12, 'Advanced'), (1, 16, 'Intermediate'), (1, 17, 'Intermediate'),
-- Ananya Iyer (Algorithms + Java + Distributed)
(2, 4, 'Advanced'), (2, 5, 'Advanced'), (2, 21, 'Advanced'), (2, 12, 'Intermediate'), (2, 13, 'Intermediate'), (2, 25, 'Advanced'),
-- Rohit Verma (Backend + DB)
(3, 1, 'Intermediate'), (3, 7, 'Advanced'), (3, 8, 'Advanced'), (3, 12, 'Advanced'), (3, 15, 'Intermediate'), (3, 22, 'Advanced'),
-- Diya Patel (AI/ML + Python)
(4, 3, 'Advanced'), (4, 9, 'Intermediate'), (4, 12, 'Intermediate'), (4, 20, 'Advanced'), (4, 21, 'Advanced'),
-- Karthik Rajan (C++ & Embedded)
(5, 5, 'Advanced'), (5, 3, 'Intermediate'), (5, 21, 'Intermediate'), (5, 25, 'Intermediate'),
-- Sneha Reddy (UI/UX & React)
(6, 1, 'Advanced'), (6, 2, 'Advanced'), (6, 6, 'Advanced'), (6, 11, 'Intermediate'), (6, 24, 'Advanced'),
-- Arjun Mehta (Full Stack Intern)
(7, 1, 'Intermediate'), (7, 6, 'Intermediate'), (7, 7, 'Intermediate'), (7, 12, 'Intermediate'), (7, 17, 'Beginner'),
-- Pooja Hegde (Cloud & Product)
(8, 3, 'Intermediate'), (8, 12, 'Advanced'), (8, 16, 'Intermediate'), (8, 22, 'Advanced'), (8, 25, 'Advanced'),
-- Varun Singh (DevOps & Linux)
(9, 3, 'Intermediate'), (9, 12, 'Intermediate'), (9, 17, 'Advanced'), (9, 18, 'Intermediate'), (9, 19, 'Advanced'),
-- Tanya Chopra (Data Analyst)
(10, 3, 'Intermediate'), (10, 12, 'Advanced'), (10, 13, 'Intermediate'), (10, 25, 'Advanced'),
-- Neeraj Pandey
(11, 3, 'Intermediate'), (11, 5, 'Intermediate'), (11, 25, 'Intermediate'),
-- Riya Sen (High-performing Cloud Engineer)
(12, 1, 'Advanced'), (12, 2, 'Advanced'), (12, 6, 'Advanced'), (12, 7, 'Advanced'), (12, 12, 'Advanced'), (12, 16, 'Advanced'), (12, 17, 'Advanced'),
-- Aditya Joshi (Security)
(13, 3, 'Intermediate'), (13, 5, 'Intermediate'), (13, 23, 'Advanced'), (13, 22, 'Intermediate'),
-- Meghna Krishnan (Backend)
(14, 4, 'Advanced'), (14, 10, 'Advanced'), (14, 12, 'Advanced'), (14, 13, 'Advanced'), (14, 22, 'Advanced'),
-- Siddharth Nair
(15, 3, 'Beginner'), (15, 12, 'Intermediate'), (15, 25, 'Advanced'),
-- Kavya Bose (ML/AI)
(16, 3, 'Advanced'), (16, 20, 'Advanced'), (16, 21, 'Advanced'), (16, 12, 'Intermediate');

-- ----------------------------------------------------------------------------
-- 7. INSERT OPPORTUNITIES (12 Jobs & Internships)
-- ----------------------------------------------------------------------------
INSERT INTO opportunities (id, recruiter_id, company_id, title, type, category, description, requirements, location, work_mode, min_cgpa, allowed_graduation_year, salary_or_stipend, openings_count, deadline, status) VALUES
(1, 1, 1, 'Software Engineer III - Cloud Platform', 'job', 'Software Development', 
 'Design, develop, test, and deploy resilient web services and large-scale distributed cloud systems powering millions of global queries.', 
 'Strong proficiency in Data Structures, Algorithms, System Design, React.js, Node.js and SQL relational databases.', 
 'Bangalore, Karnataka', 'Hybrid', 8.50, 2025, '₹ 28,00,000 - ₹ 34,00,000 PA', 4, '2026-12-31', 'approved'),

(2, 1, 1, 'Summer Cloud Engineering Intern', 'internship', 'Cloud & DevOps', 
 'Work alongside Google Cloud Core infrastructure teams on telemetry, container scheduling, and distributed database services.', 
 'Pursuing B.Tech/BE in CSE/IT. Familiarity with Docker, Linux commands, Python or C++, and core computer science fundamentals.', 
 'Hyderabad, Telangana', 'On-site', 8.00, 2026, '₹ 1,10,000 / month', 6, '2026-11-30', 'approved'),

(3, 2, 2, 'Azure Distributed Systems Engineer', 'job', 'Software Development', 
 'Build next-generation hyper-scale Azure cloud infrastructure and high-throughput real-time enterprise microservices.', 
 'Excellent proficiency in C++, Java or C#, Object-Oriented Design, Relational DBs (MySQL/SQL Server), and concurrent programming.', 
 'Hyderabad, Telangana', 'Hybrid', 8.00, 2025, '₹ 24,00,000 - ₹ 30,00,000 PA', 5, '2026-12-15', 'approved'),

(4, 2, 2, 'Full Stack Web Developer Intern', 'internship', 'Software Development', 
 'Collaborate with Microsoft 365 development team to deliver engaging user interfaces and highly performant backend REST APIs.', 
 'Knowledge of TypeScript, React.js, Node.js, Git, and REST API development. Strong problem-solving aptitude.', 
 'Bangalore, Karnataka', 'Remote', 7.50, 2026, '₹ 85,000 / month', 8, '2026-11-25', 'approved'),

(5, 3, 3, 'Software Development Engineer I (SDE-1)', 'job', 'Software Development', 
 'Architect customer-facing microservices handling billions of transactions at sub-millisecond latencies for Amazon AWS infrastructure.', 
 'Strong coding ability in Java/C++/Python, solid grounding in Relational Databases (MySQL/PostgreSQL), and Distributed Systems concepts.', 
 'Bangalore, Karnataka', 'On-site', 8.00, 2025, '₹ 26,00,000 - ₹ 32,00,000 PA', 5, '2026-12-20', 'approved'),

(6, 3, 3, 'Applied Machine Learning Intern', 'internship', 'Data Science', 
 'Develop state-of-the-art predictive machine learning models, inference optimization, and deep learning pipelines on AWS SageMaker.', 
 'Hands-on experience in Python, PyTorch or TensorFlow, Machine Learning algorithms, and SQL data extraction.', 
 'Bangalore, Karnataka', 'Hybrid', 8.50, 2026, '₹ 95,00,0 / month', 3, '2026-12-10', 'approved'),

(7, 4, 4, 'Cybersecurity & Risk Advisory Consultant', 'job', 'Cybersecurity', 
 'Assist Fortune 500 clients in auditing digital infrastructures, mitigating cloud vulnerabilities, and implementing zero-trust architectures.', 
 'Understanding of Network Security, Information Security Standards, OWASP Top 10, Operating Systems, and analytical thinking.', 
 'Gurgaon, Haryana', 'Hybrid', 7.00, 2025, '₹ 12,00,000 - ₹ 15,00,000 PA', 6, '2026-12-28', 'approved'),

(8, 4, 4, 'Technology Strategy & Analytics Intern', 'internship', 'Data Science', 
 'Analyze business datasets, design interactive executive dashboards, and formulate digital transformation recommendations.', 
 'Proficiency in Advanced SQL queries, Python, data visualization tools, and exceptional verbal & written communication.', 
 'Mumbai, Maharashtra', 'Hybrid', 7.50, 2026, '₹ 45,000 / month', 4, '2026-11-28', 'approved'),

(9, 5, 5, 'Specialist Programmer - Full Stack', 'job', 'Software Development', 
 'High-impact development role focusing on modern cloud-native architectures, containerization, and full-stack software development.', 
 'Proven skills in Java or Node.js, Modern JavaScript/React, MySQL/NoSQL, and container basics (Docker).', 
 'Bangalore, Karnataka', 'On-site', 7.00, 2025, '₹ 9,50,000 - ₹ 12,00,000 PA', 10, '2026-12-31', 'approved'),

(10, 5, 5, 'Digital Innovation Intern', 'internship', 'Software Development', 
 'Join the Infosys living labs to build innovative prototypes using AI, cloud computing, and responsive web technologies.', 
 'Pre-final year students with sound fundamentals in Web technologies (HTML/CSS/JS), Database basics, and programming.', 
 'Pune, Maharashtra', 'On-site', 6.50, 2026, '₹ 35,000 / month', 12, '2026-12-05', 'approved'),

(11, 6, 6, 'TCS Digital Developer - Cloud & AI', 'job', 'Software Development', 
 'Work on high-end niche technologies like Big Data, Artificial Intelligence, IoT, Cloud Services, and Enterprise Web Applications.', 
 'Strong problem solving, command over any object oriented language (Java/Python/C++), and relational database querying.', 
 'Chennai, Tamil Nadu', 'On-site', 7.00, 2025, '₹ 8,50,000 - ₹ 11,00,000 PA', 15, '2026-12-31', 'approved'),

(12, 1, 1, 'Site Reliability & DevOps Engineer', 'job', 'Cloud & DevOps', 
 'Maintain, automate and enhance the world\'s largest distributed infrastructure. Write code to eliminate manual operations.', 
 'Deep familiarity with Linux systems, Docker, Kubernetes, CI/CD pipelines, and Python/Go scripting.', 
 'Bangalore, Karnataka', 'Hybrid', 8.20, 2025, '₹ 22,00,000 - ₹ 26,00,000 PA', 3, '2026-12-25', 'pending_approval');

-- ----------------------------------------------------------------------------
-- 8. INSERT OPPORTUNITY_SKILLS MAPPINGS
-- ----------------------------------------------------------------------------
INSERT INTO opportunity_skills (opportunity_id, skill_id, is_required) VALUES
-- Opp 1: Google SWE (React, Node, MySQL, Cloud, DSA)
(1, 1, TRUE), (1, 6, TRUE), (1, 7, TRUE), (1, 12, TRUE), (1, 16, FALSE), (1, 21, TRUE),
-- Opp 2: Google Cloud Intern (Docker, Python, C++, DSA)
(2, 3, TRUE), (2, 5, FALSE), (2, 17, TRUE), (2, 21, TRUE),
-- Opp 3: Microsoft Azure (C++, Java, MySQL, DSA)
(3, 4, TRUE), (3, 5, TRUE), (3, 12, TRUE), (3, 21, TRUE),
-- Opp 4: Microsoft Web Intern (TypeScript, React, Node, REST)
(4, 1, TRUE), (4, 2, TRUE), (4, 6, TRUE), (4, 7, TRUE), (4, 22, TRUE),
-- Opp 5: Amazon SDE-1 (Java, Python, MySQL, DSA)
(5, 4, TRUE), (5, 3, FALSE), (5, 12, TRUE), (5, 21, TRUE),
-- Opp 6: Amazon ML Intern (Python, ML, MySQL)
(6, 3, TRUE), (6, 20, TRUE), (6, 12, TRUE), (6, 21, FALSE),
-- Opp 7: Deloitte Security (Cybersecurity, Python, Communication)
(7, 23, TRUE), (7, 3, FALSE), (7, 25, TRUE),
-- Opp 8: Deloitte Data Intern (Python, MySQL, Communication)
(8, 3, TRUE), (8, 12, TRUE), (8, 25, TRUE),
-- Opp 9: Infosys Specialist (React, Node, Java, MySQL)
(9, 6, TRUE), (9, 7, TRUE), (9, 4, FALSE), (9, 12, TRUE),
-- Opp 10: Infosys Intern (JavaScript, MySQL)
(10, 1, TRUE), (10, 12, TRUE), (10, 25, FALSE),
-- Opp 11: TCS Digital (Java, Python, MySQL, DSA)
(11, 4, TRUE), (11, 3, FALSE), (11, 12, TRUE), (11, 21, TRUE),
-- Opp 12: Google SRE (Docker, Kubernetes, CI/CD, Python)
(12, 17, TRUE), (12, 18, TRUE), (12, 19, TRUE), (12, 3, TRUE);

-- ----------------------------------------------------------------------------
-- 9. INSERT APPLICATIONS (28 Applications across all 6 Statuses)
-- ----------------------------------------------------------------------------
INSERT INTO applications (id, opportunity_id, student_id, status, cover_letter, resume_url, match_score, applied_at) VALUES
-- Student 1: Aarav Sharma -> Selected at Google, Shortlisted at Amazon, Applied at MS
(1, 1, 1, 'Selected', 'I am enthusiastic about applying for Google Cloud. I have built multiple production-grade React/Node cloud solutions.', '/uploads/sample-resume.pdf', 95, '2026-10-01 10:00:00'),
(2, 5, 1, 'Shortlisted', 'Passionate about high throughput AWS architecture. Experienced in relational databases and scalable APIs.', '/uploads/sample-resume.pdf', 80, '2026-10-03 11:30:00'),
(3, 3, 1, 'Under Review', 'Excited about Azure distributed systems and large scale software engineering.', '/uploads/sample-resume.pdf', 75, '2026-10-05 14:15:00'),

-- Student 2: Ananya Iyer -> Selected at Amazon, Selected at Microsoft, Interview at Google
(4, 5, 2, 'Selected', 'As a competitive coder and 5-star programmer, I thrive on challenging algorithm and distributed problems.', '/uploads/sample-resume.pdf', 95, '2026-10-02 09:20:00'),
(5, 3, 2, 'Selected', 'Deep interest in low-level systems and high concurrency design in C++ and Java.', '/uploads/sample-resume.pdf', 100, '2026-10-04 15:45:00'),
(6, 1, 2, 'Interview', 'Passionate about Google large-scale distributed systems and data structures.', '/uploads/sample-resume.pdf', 85, '2026-10-06 16:00:00'),

-- Student 3: Rohit Verma -> Shortlisted at Infosys Specialist, Applied at TCS
(7, 9, 3, 'Shortlisted', 'Experienced back-end developer with strong mastery of MySQL optimizations and Express.js.', '/uploads/sample-resume.pdf', 90, '2026-10-08 12:10:00'),
(8, 11, 3, 'Under Review', 'Interested in TCS Digital development and database architecture roles.', '/uploads/sample-resume.pdf', 75, '2026-10-10 13:00:00'),

-- Student 4: Diya Patel -> Selected at Amazon ML Intern, Interview at Deloitte Data
(9, 6, 4, 'Selected', 'Applied ML researcher with deep Python, PyTorch, and SQL experience looking forward to AWS SageMaker.', '/uploads/sample-resume.pdf', 100, '2026-10-05 10:45:00'),
(10, 8, 4, 'Interview', 'Excited to deliver data analytics and strategy for Deloitte enterprise clients.', '/uploads/sample-resume.pdf', 90, '2026-10-07 14:20:00'),

-- Student 5: Karthik Rajan -> Under Review at Microsoft Azure, Rejected at Google SWE (due to CGPA req)
(11, 3, 5, 'Under Review', 'ECE background with deep hardware/software co-design and C++ skills.', '/uploads/sample-resume.pdf', 75, '2026-10-12 11:00:00'),

-- Student 6: Sneha Reddy -> Shortlisted at Microsoft Intern, Selected at Google SWE
(12, 4, 6, 'Shortlisted', 'Obsessed with building delightful and highly responsive web user interfaces.', '/uploads/sample-resume.pdf', 95, '2026-10-09 15:30:00'),
(13, 1, 6, 'Selected', 'Excited to contribute to Google web platforms and frontend infrastructure.', '/uploads/sample-resume.pdf', 90, '2026-10-11 16:40:00'),

-- Student 7: Arjun Mehta (2026 Batch Intern) -> Selected at Microsoft Intern, Under Review at Google Intern
(14, 4, 7, 'Selected', 'Pre-final year developer looking to contribute to Microsoft 365 web apps.', '/uploads/sample-resume.pdf', 85, '2026-10-12 14:00:00'),
(15, 2, 7, 'Under Review', 'Keen on Google Cloud container scheduling and cloud automation.', '/uploads/sample-resume.pdf', 75, '2026-10-13 17:15:00'),

-- Student 8: Pooja Hegde (2026 Batch Intern) -> Interview at Deloitte Data, Shortlisted at Microsoft Intern
(16, 8, 8, 'Interview', 'Enthusiastic about data analytics, stakeholder presentation and SQL databases.', '/uploads/sample-resume.pdf', 95, '2026-10-14 11:20:00'),
(17, 4, 8, 'Shortlisted', 'Strong product mindset and full-stack web development foundations.', '/uploads/sample-resume.pdf', 75, '2026-10-15 12:45:00'),

-- Student 9: Varun Singh -> Rejected at Amazon (shortage in required DSA), Selected at TCS Digital
(18, 5, 9, 'Rejected', 'DevOps engineer seeking to bring automation and reliability to Amazon systems.', '/uploads/sample-resume.pdf', 50, '2026-10-02 08:30:00'),
(19, 11, 9, 'Selected', 'Ready to deliver scalable enterprise solutions and Linux automations at TCS.', '/uploads/sample-resume.pdf', 80, '2026-10-16 10:10:00'),

-- Student 10: Tanya Chopra -> Selected at Deloitte Data, Shortlisted at Infosys
(20, 8, 10, 'Selected', 'Data analytics student eager to solve business intelligence problems.', '/uploads/sample-resume.pdf', 95, '2026-10-17 09:50:00'),
(21, 9, 10, 'Shortlisted', 'Skilled in relational SQL queries and data-driven web solutions.', '/uploads/sample-resume.pdf', 70, '2026-10-18 11:15:00'),

-- Student 11: Neeraj Pandey -> Under Review at TCS Digital
(22, 11, 11, 'Under Review', 'Mechanical engineer with passion for automation and software programming.', '/uploads/sample-resume.pdf', 65, '2026-10-19 14:30:00'),

-- Student 12: Riya Sen -> Selected at Google SWE, Selected at Amazon SDE-1
(23, 1, 12, 'Selected', 'Proven track record of building production cloud systems and scalable React apps.', '/uploads/sample-resume.pdf', 100, '2026-10-01 11:00:00'),
(24, 5, 12, 'Selected', 'Love building distributed backends and zero-downtime microservices.', '/uploads/sample-resume.pdf', 95, '2026-10-03 14:00:00'),

-- Student 13: Aditya Joshi -> Interview at Deloitte Security
(25, 7, 13, 'Interview', 'Passionate about cyber defense, vulnerability scanning, and secure API architecture.', '/uploads/sample-resume.pdf', 90, '2026-10-20 16:00:00'),

-- Student 14: Meghna Krishnan -> Selected at Infosys Specialist, Shortlisted at Amazon
(26, 9, 14, 'Selected', 'Specialist in Spring Boot microservices, MySQL database normalization, and REST.', '/uploads/sample-resume.pdf', 95, '2026-10-21 10:00:00'),
(27, 5, 14, 'Shortlisted', 'Strong command over object-oriented Java and high-performance databases.', '/uploads/sample-resume.pdf', 85, '2026-10-22 13:20:00'),

-- Student 16: Kavya Bose -> Selected at Amazon ML Intern
(28, 6, 16, 'Selected', 'Research background in deep learning models and PyTorch deployment on cloud.', '/uploads/sample-resume.pdf', 100, '2026-10-23 15:40:00');

-- ----------------------------------------------------------------------------
-- 10. INSERT APPLICATION STATUS HISTORY (Demonstrating Audit Trail)
-- ----------------------------------------------------------------------------
INSERT INTO application_status_history (application_id, status, remarks, changed_by_user_id, changed_at) VALUES
(1, 'Applied', 'Candidate applied online via portal.', 8, '2026-10-01 10:00:00'),
(1, 'Under Review', 'Resume and GitHub profile reviewed by recruiting lead.', 2, '2026-10-05 11:00:00'),
(1, 'Shortlisted', 'Shortlisted based on high skill match score (95%) and strong CGPA.', 2, '2026-10-10 14:00:00'),
(1, 'Interview', 'Technical Rounds 1 & 2 scheduled and completed with positive feedback.', 2, '2026-10-18 16:30:00'),
(1, 'Selected', 'Official offer letter extended for Cloud SWE role at Bangalore!', 2, '2026-10-25 12:00:00'),

(4, 'Applied', 'Candidate applied for SDE-1.', 9, '2026-10-02 09:20:00'),
(4, 'Under Review', 'Screened by AWS Technical Hiring team.', 4, '2026-10-06 10:00:00'),
(4, 'Shortlisted', 'Cleared online coding assessment with 100% score.', 4, '2026-10-12 11:30:00'),
(4, 'Interview', 'Bar Raiser and Algorithm rounds cleared.', 4, '2026-10-20 15:00:00'),
(4, 'Selected', 'Offer released for SDE-1 Bangalore position!', 4, '2026-10-27 10:15:00'),

(18, 'Applied', 'Candidate submitted application.', 16, '2026-10-02 08:30:00'),
(18, 'Under Review', 'Application under review.', 4, '2026-10-07 10:00:00'),
(18, 'Rejected', 'Did not meet the core algorithmic and coding benchmark required for SDE-1.', 4, '2026-10-15 14:00:00');

-- ----------------------------------------------------------------------------
-- 11. INSERT NOTIFICATIONS (Real-time student alerts)
-- ----------------------------------------------------------------------------
INSERT INTO notifications (user_id, title, message, type, reference_id, is_read, created_at) VALUES
(8, 'Offer Letter Alert! Google India', 'Congratulations Aarav! You have been Selected for "Software Engineer III - Cloud Platform" at Google India.', 'application_status', 1, FALSE, '2026-10-25 12:01:00'),
(8, 'Application Shortlisted: Amazon AWS', 'Your application for "Software Development Engineer I (SDE-1)" has been Shortlisted.', 'application_status', 2, TRUE, '2026-10-10 14:05:00'),
(9, 'Offer Letter Alert! Amazon AWS', 'Congratulations Ananya! You have been Selected for "Software Development Engineer I (SDE-1)" at Amazon AWS.', 'application_status', 4, FALSE, '2026-10-27 10:16:00'),
(9, 'Offer Letter Alert! Microsoft IDC', 'Congratulations Ananya! You have also been Selected for "Azure Distributed Systems Engineer" at Microsoft IDC!', 'application_status', 5, FALSE, '2026-10-28 11:00:00'),
(11, 'Offer Letter Alert! Amazon AWS', 'Congratulations Diya! You have been Selected for "Applied Machine Learning Intern" at Amazon Web Services.', 'application_status', 9, FALSE, '2026-10-26 15:30:00'),
(16, 'Update on Application: Amazon AWS', 'Thank you for your interest in SDE-1. Your application status was updated to Rejected.', 'application_status', 18, TRUE, '2026-10-15 14:02:00'),
(16, 'Offer Letter Alert! TCS Digital', 'Congratulations Varun! You have been Selected for "TCS Digital Developer - Cloud & AI" at Tata Consultancy Services!', 'application_status', 19, FALSE, '2026-10-29 16:00:00');
