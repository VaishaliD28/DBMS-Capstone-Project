import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import BrowseOpportunitiesPage from './pages/BrowseOpportunitiesPage';
import JobDetailsPage from './pages/JobDetailsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ManageOpportunitiesPage from './pages/ManageOpportunitiesPage';
import ManageApplicantsPage from './pages/ManageApplicantsPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminRecruitersPage from './pages/AdminRecruitersPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminSqlAnalyticsPage from './pages/AdminSqlAnalyticsPage';

export default function App() {
  const { user, role, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync default page when logging in or out
  React.useEffect(() => {
    if (user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')) {
      if (role === 'admin') setCurrentPage('admin-dashboard');
      else if (role === 'recruiter') setCurrentPage('recruiter-dashboard');
      else setCurrentPage('student-dashboard');
    } else if (!user && currentPage !== 'browse-jobs' && currentPage !== 'browse-internships' && currentPage !== 'job-details' && currentPage !== 'register') {
      setCurrentPage('landing');
    }
  }, [user, role]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        color: '#2563eb',
        fontFamily: 'sans-serif',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Initializing Campus Placement Portal...
      </div>
    );
  }

  // Determine Page Title
  const getPageTitle = () => {
    switch (currentPage) {
      case 'student-dashboard': return 'Student Overview';
      case 'browse-jobs': return 'Browse Full-Time Jobs';
      case 'browse-internships': return 'Browse Internships';
      case 'job-details': return 'Opportunity Details';
      case 'my-applications': return 'My Applications';
      case 'student-profile': return 'My Student Profile';
      case 'recruiter-dashboard': return 'Recruiter Portal';
      case 'manage-opportunities': return 'Manage Postings';
      case 'manage-applicants': return 'Applicant Pipeline';
      case 'company-profile': return 'Company Profile';
      case 'admin-dashboard': return 'Placement Administration';
      case 'admin-students': return 'Student Directory';
      case 'admin-recruiters': return 'Corporate Partners';
      case 'admin-applications': return 'Global Applications';
      case 'admin-sql': return 'DBMS SQL Analytics Showcase';
      default: return 'Campus Portal';
    }
  };

  // Standalone pages (Landing, Login, Register)
  if (!user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')) {
    if (currentPage === 'login') return <LoginPage setCurrentPage={setCurrentPage} />;
    if (currentPage === 'register') return <RegisterPage setCurrentPage={setCurrentPage} />;
    return <LandingPage setCurrentPage={setCurrentPage} />;
  }

  // Render Page Content
  const renderContent = () => {
    switch (currentPage) {
      // Student Pages
      case 'student-dashboard':
        return <StudentDashboard setCurrentPage={setCurrentPage} setSelectedOpportunity={setSelectedOpportunity} />;
      case 'browse-jobs':
        return <BrowseOpportunitiesPage initialType="job" setCurrentPage={setCurrentPage} setSelectedOpportunity={setSelectedOpportunity} />;
      case 'browse-internships':
        return <BrowseOpportunitiesPage initialType="internship" setCurrentPage={setCurrentPage} setSelectedOpportunity={setSelectedOpportunity} />;
      case 'job-details':
        return <JobDetailsPage opportunity={selectedOpportunity} onBack={() => setCurrentPage(role === 'student' ? 'browse-jobs' : 'manage-opportunities')} setCurrentPage={setCurrentPage} />;
      case 'my-applications':
        return <MyApplicationsPage setCurrentPage={setCurrentPage} setSelectedOpportunity={setSelectedOpportunity} />;
      case 'student-profile':
        return <StudentProfilePage />;

      // Recruiter Pages
      case 'recruiter-dashboard':
        return <RecruiterDashboard setCurrentPage={setCurrentPage} setSelectedOpportunity={setSelectedOpportunity} />;
      case 'manage-opportunities':
        return <ManageOpportunitiesPage setCurrentPage={setCurrentPage} setSelectedOpportunity={setSelectedOpportunity} />;
      case 'manage-applicants':
        return <ManageApplicantsPage selectedOpportunity={selectedOpportunity} setSelectedOpportunity={setSelectedOpportunity} />;
      case 'company-profile':
        return <CompanyProfilePage />;

      // Admin Pages
      case 'admin-dashboard':
        return <AdminDashboard setCurrentPage={setCurrentPage} />;
      case 'admin-students':
        return <AdminStudentsPage />;
      case 'admin-recruiters':
        return <AdminRecruitersPage />;
      case 'admin-applications':
        return <AdminApplicationsPage />;
      case 'admin-sql':
        return <AdminSqlAnalyticsPage />;

      default:
        return <StudentDashboard setCurrentPage={setCurrentPage} setSelectedOpportunity={setSelectedOpportunity} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          pageTitle={getPageTitle()}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main>{renderContent()}</main>
      </div>
    </div>
  );
}
