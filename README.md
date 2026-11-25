# 🎓 University Job & Internship Management System
## DBMS Capstone Project | B.Tech Computer Science & Engineering

A complete, modern, professional, and fully functional web-based **Job & Internship Management System** designed for a university placement portal. Built with **React, Node.js, Express.js, and a 3NF normalized MySQL database**.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [User Roles & Dashboards](#-user-roles--dashboards)
4. [Relational Database Design (MySQL)](#-relational-database-design-mysql)
5. [Core DBMS Concepts Demonstrated](#-core-dbms-concepts-demonstrated)
6. [Advanced Features](#-advanced-features)
7. [Project Folder Structure](#-project-folder-structure)
8. [Installation & Setup Instructions](#-installation--setup-instructions)
9. [Default Test Credentials & 1-Click Demo](#-default-test-credentials--1-click-demo)
10. [API Testing with Postman](#-api-testing-with-postman)

---

## 🌟 Project Overview

The **Job & Internship Management System** automates the university placement cycle. It bridges communication between students, corporate recruitment partners, and the university placement administration.

- **Students** create academic profiles, manage skills, upload PDF resumes, evaluate their eligibility in real-time, get dynamic skill compatibility scores, and track multi-stage applications.
- **Recruiters** post jobs and internships, define CGPA criteria, review matched candidate profiles, inspect resumes, and update recruitment status stages with custom remarks.
- **Placement Administrators** review portal statistics, approve new job postings, monitor candidate selections, manage student/recruiter access, and analyze department-wise hiring trends through interactive charts.

---

## 🛠 Technology Stack

| Layer | Technologies Used | Description |
|---|---|---|
| **Frontend** | React 18, Vite, CSS3, Lucide React, Chart.js | Modern, responsive component-based UI with interactive placement charts |
| **Backend** | Node.js, Express.js | Modular RESTful API with controllers, routes, and middleware |
| **Database** | MySQL 8.0 | Normalized relational database (`job_internship_db`) |
| **Database Driver** | `mysql2/promise` | Connection pooling, parameterized queries, and ACID transactions |
| **Authentication** | JWT (JSON Web Tokens), `bcryptjs` | Role-based authorization & salted password hashing |
| **File Storage** | Multer | Secure server storage for student PDF resumes and corporate logos |
| **API Testing** | Postman | Full Postman collection provided (`postman_collection.json`) |

> **Note:** MongoDB is NOT used. MySQL is the primary relational database.

---

## 👥 User Roles & Dashboards

### 1. Student Portal
- **Authentication:** Registration & secure login.
- **Profile Management:** Update academic details (Roll Number, Department, CGPA, Passing Batch, Bio).
- **Resume Upload:** Upload and download verified resumes in PDF format.
- **Technical Skills Catalog:** Add skills with proficiency levels (*Beginner, Intermediate, Advanced*).
- **Opportunity Browsing:** Search and filter jobs/internships by company, location, salary, work mode, and min CGPA.
- **Smart Skill Matching:** Live match score percentage calculated against job requirements.
- **Eligibility Verification:** Dynamic checks against CGPA, allowed graduation year, and application deadlines.
- **Application Tracker:** Visual 5-step progress stepper (*Applied ➔ Under Review ➔ Shortlisted ➔ Interview ➔ Selected / Rejected*) with recruiter feedback.
- **In-App Notifications:** Real-time alerts when application status changes.

### 2. Recruiter / Corporate Portal
- **Authentication:** Recruiter registration linked to companies.
- **Company Profile:** Manage organization bio, website, industry, headquarters, and logo.
- **Manage Opportunities:** Post, edit, close, and delete jobs and internships with required skill tags.
- **Candidate Pipeline:** View applicants, sort by Skill Match % or CGPA, inspect student profiles and resumes.
- **Status Progression:** Advance candidate stages (*Shortlisted, Interview, Selected, Rejected*) with custom remarks.

### 3. Administrator Portal
- **KPI Metrics:** Total Students, Partner Companies, Active Jobs, Total Applications, Placement Rate (%), Campus Average CGPA.
- **Interactive Analytics:**
  - Department-wise placement percentage (Bar Chart).
  - Application status distribution (Doughnut Chart).
  - In-demand technical skills in corporate postings (Bar Chart).
- **Account Control:** Search and toggle status (*Active / Suspended*) for students and recruiters.
- **Opportunity Moderation:** Review and approve or reject job postings submitted by recruiters.
- **DBMS SQL Analytics Showcase:** Live query runner demonstrating complex DBMS queries.

---

## 🗄 Relational Database Design (MySQL)

Database Name: `job_internship_db`

### 3NF Normalization
The database is strictly normalized to **Third Normal Form (3NF)**:
- **1NF:** All attributes contain atomic values, and each table has a primary key.
- **2NF:** All non-key attributes are fully functionally dependent on the entire primary key (composite keys in junction tables use full dependencies).
- **3NF:** No transitive dependencies exist (e.g., Company details are isolated from Recruiter tuples; Skills catalog is separated from Student profiles).

### Tables & Relationships
1. **`users`**: Base credentials, role (`student`, `recruiter`, `admin`), account status.
2. **`companies`**: Corporate organizations offering campus placements.
3. **`students`**: Academic profile (1-to-1 with `users`, unique `roll_number`, `cgpa`, `graduation_year`, `resume_url`).
4. **`recruiters`**: Corporate hiring leads (1-to-1 with `users`, N-to-1 with `companies`).
5. **`skills`**: Master skill taxonomy (`name`, `category`).
6. **`student_skills`**: Junction table (M:N) connecting students with skills and proficiency levels.
7. **`opportunities`**: Jobs and internships created by recruiters.
8. **`opportunity_skills`**: Junction table (M:N) mapping required skills to opportunities.
9. **`applications`**: Student submissions (`status`, `match_score`, `cover_letter`, `resume_url`). UNIQUE constraint on `(opportunity_id, student_id)` prevents duplicates!
10. **`application_status_history`**: Audit trail logging every status transition, timestamp, and recruiter remarks.
11. **`notifications`**: Real-time alerts triggered by application status updates.

### Database Views
- `vw_active_opportunities_with_companies`: Approved, unexpired opportunities with company logos and total application counts.
- `vw_student_application_details`: Multi-table view combining student academic details, job specs, company info, and application status.
- `vw_placement_analytics`: Aggregate department summary computing total students, placed students, and placement percentage.
- `vw_company_recruitment_summary`: Summarizes postings and applicants per company.

---

## ⚡ Core DBMS Concepts Demonstrated

| Concept | Implementation in Project | File Reference |
|---|---|---|
| **CRUD Operations** | Full Create, Read, Update, Delete for opportunities, profiles, skills, and applications | `backend/controllers/` |
| **INNER JOIN** | Joining `opportunities`, `companies`, and `recruiters` for job listings | `database/queries.sql` |
| **LEFT JOIN** | Querying all students and their application counts, retaining students with 0 applications | `database/queries.sql` |
| **Multi-Table JOIN** | 5-table join linking `applications`, `students`, `opportunities`, `companies`, and `users` | `database/queries.sql` |
| **GROUP BY & HAVING** | Grouping by department with `HAVING AVG(cgpa) >= 8.0` | `database/queries.sql` |
| **Aggregate Functions** | `COUNT`, `AVG`, `MIN`, `MAX`, `SUM` for campus placement metrics | `database/queries.sql` |
| **Subqueries** | Single-row subquery filtering students with CGPA above `(SELECT AVG(cgpa) FROM students)` | `database/queries.sql` |
| **Correlated Subqueries** | Finding highest match score application for each student | `database/queries.sql` |
| **Stored Procedures** | `sp_apply_for_opportunity`, `sp_update_application_status`, `sp_calculate_skill_match`, `sp_get_admin_dashboard_stats` | `database/procedures.sql` |
| **Stored Triggers** | `trg_after_application_insert`, `trg_after_application_status_update`, `trg_before_application_insert` | `database/triggers.sql` |
| **ACID Transactions** | Atomic commit/rollback on application submission with audit history & notification | `database/procedures.sql` |
| **Database Indexing** | Indexes on foreign keys, status enums, roll numbers, and deadlines | `database/schema.sql` |

---

## 🚀 Advanced Features

1. **Smart Skill Matching:** Dynamically intersects student technical skills with opportunity requirements, computing compatibility percentages displayed on job cards and applicant tables.
2. **Dynamic Eligibility Checker:** Compares student CGPA against minimum criteria, verifies graduation year, and checks deadline status before permitting application submission.
3. **Application Progress Tracker:** A visual 5-step stepper (*Applied ➔ Under Review ➔ Shortlisted ➔ Interview ➔ Selected / Rejected*) showing status, remarks, and timestamp history.
4. **Faceted Search & Filters:** Live search by title, company, category, work mode (*On-site, Remote, Hybrid*), location, and minimum CGPA.
5. **Interactive Analytics Charts:** Rendered using Chart.js displaying department placement ratios, applicant pipeline distribution, and in-demand skills.
6. **In-App Notification Center:** Alert bell with unread badge updating students when recruiter reviews their application.

---

## 📂 Project Folder Structure

```
dbms capstone/
├── backend/
│   ├── config/
│   │   ├── db.js                     # MySQL2 connection pool with automatic fallback
│   │   ├── fallbackData.js           # Relational dataset matching sample_data.sql
│   │   └── fallbackEngine.js         # Relational query processor
│   ├── controllers/
│   │   ├── adminController.js        # Admin analytics, approvals & user management
│   │   ├── applicationController.js  # Apply, review & status workflow
│   │   ├── authController.js         # Login, registration & JWT signing
│   │   ├── notificationController.js # In-app notification alerts
│   │   ├── opportunityController.js  # Job/Internship CRUD & filters
│   │   ├── recruiterController.js    # Recruiter & company profile
│   │   ├── skillController.js        # Skills catalog
│   │   └── studentController.js      # Student profile, resume upload & eligibility
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification & role authorization
│   │   └── upload.js                 # Multer storage for PDF resumes
│   ├── routes/                       # Express route definitions
│   ├── scripts/
│   │   └── init_db.js                # Database initialization script
│   ├── uploads/
│   │   └── sample-resume.pdf         # Default resume asset
│   ├── app.js                        # Express application configuration
│   ├── server.js                     # Server entry point (Port 5000)
│   ├── package.json
│   └── .env                          # Database & server credentials
├── database/
│   ├── schema.sql                    # 3NF Schema: 11 tables, constraints, indexes & views
│   ├── procedures.sql                # Stored procedures & transactional logic
│   ├── triggers.sql                  # Database triggers for audit logs & alerts
│   ├── sample_data.sql               # 16 students, 6 companies, 12 jobs, 28 applications
│   └── queries.sql                   # Complex queries demonstrating DBMS concepts
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, StatCard, Tracker, Cards, Modals
│   │   ├── context/                  # AuthContext with 1-click quick demo logins
│   │   ├── pages/                    # Dashboards, Browse, Profile, Admin management
│   │   ├── services/                 # API client service layer
│   │   ├── styles/index.css          # Modern CSS styling system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── postman_collection.json           # Comprehensive Postman API collection
├── package.json                      # Root scripts
└── README.md                         # Complete documentation
```

---

## 💻 Installation & Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MySQL Server** (MySQL 8.0, XAMPP, MariaDB, or Docker)

---

### Step 1: Configure MySQL Credentials
Open `backend/.env` and update your MySQL connection details if needed:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_placement_portal_jwt_key_2026_capstone
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=job_internship_db
```

---

### Step 2: Initialize Database
Start your MySQL service (via XAMPP Control Panel, Windows Services, or MySQL CLI), then run:
```bash
npm run db:init
```
This automated script will:
1. Create the `job_internship_db` database.
2. Execute `database/schema.sql` (creating all 11 tables, constraints, indexes, and views).
3. Register stored procedures from `database/procedures.sql`.
4. Install triggers from `database/triggers.sql`.
5. Seed realistic sample data from `database/sample_data.sql`.

*(Note: If MySQL service is not currently active, the backend features an integrated in-memory relational mock pre-populated with identical sample data so that the app, dashboards, and APIs remain testable without crashing).*

---

### Step 3: Start the Backend Server
In the root directory, run:
```bash
npm run backend
```
The server will start at: **`http://localhost:5000`**
- Health Check: `http://localhost:5000/api/health`

---

### Step 4: Start the Frontend Application
Open a new terminal in the root directory and run:
```bash
npm run frontend
```
The application will open at: **`http://localhost:5173`**

---

## 🔑 Default Test Credentials & 1-Click Demo

The login page features **1-Click Quick Demo Buttons** for instant evaluation without typing:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `aarav.sharma@student.edu` | `student123` | Full Stack Student (9.45 CGPA, CSE) |
| **Recruiter** | `recruiter.google@placement.edu` | `recruiter123` | Google India Lead Recruiter |
| **Admin** | `admin@placement.edu` | `admin123` | University Placement Cell Officer |

*Additional student accounts:*
- `ananya.iyer@student.edu` (9.80 CGPA, Selected at Amazon & Microsoft)
- `rohit.verma@student.edu` (8.65 CGPA, IT Department)
- `diya.patel@student.edu` (9.12 CGPA, Selected at AWS ML)

---

## 📮 API Testing with Postman

1. Open **Postman**.
2. Click **Import** ➔ select `postman_collection.json` located in the root directory.
3. All requests are grouped by category:
   - **Authentication** (`POST /api/auth/login`, `POST /api/auth/register/...`)
   - **Student Profile & Skills** (`GET /api/students/profile`, `GET /api/students/eligibility/:id`)
   - **Opportunities** (`GET /api/opportunities`, `POST /api/opportunities`)
   - **Applications Workflow** (`POST /api/applications/apply`, `PUT /api/applications/:id/status`)
   - **Admin Analytics & SQL Showcase** (`GET /api/admin/dashboard-stats`, `GET /api/admin/analytics-showcase/:key`)

---

## 🎓 Capstone Presentation Highlights
- **Normalized Relational Model:** Demonstrates 3NF compliance with appropriate primary/foreign keys and junction tables.
- **Active Database Rules:** Triggers automatically create audit trails in `application_status_history` and queue in-app notifications.
- **Transactional Integrity:** Applications and status updates are processed inside atomic transactions.
- **Live DBMS Showcase Page:** Evaluators can inspect the exact SQL queries executed on live data in the Admin Portal under **DBMS SQL Analytics**.
