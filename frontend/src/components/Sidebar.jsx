import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  FileText,
  User,
  Building2,
  Users,
  CheckCircle2,
  Database,
  LogOut,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }) {
  const { user, role, logout } = useAuth();

  // Navigation Links definition based on Role
  const studentLinks = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'browse-jobs', label: 'Browse Jobs', icon: Briefcase },
    { id: 'browse-internships', label: 'Browse Internships', icon: GraduationCap },
    { id: 'my-applications', label: 'My Applications', icon: FileText },
    { id: 'student-profile', label: 'Student Profile', icon: User }
  ];

  const recruiterLinks = [
    { id: 'recruiter-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'manage-opportunities', label: 'Manage Postings', icon: Briefcase },
    { id: 'manage-applicants', label: 'Manage Applicants', icon: Users },
    { id: 'company-profile', label: 'Company Profile', icon: Building2 }
  ];

  const adminLinks = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-students', label: 'Manage Students', icon: GraduationCap },
    { id: 'admin-recruiters', label: 'Manage Recruiters', icon: Building2 },
    { id: 'admin-applications', label: 'All Applications', icon: FileText },
    { id: 'admin-sql', label: 'DBMS SQL Analytics', icon: Database }
  ];

  const links = role === 'student' ? studentLinks : role === 'recruiter' ? recruiterLinks : adminLinks;

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    if (window.innerWidth < 1024 && setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-icon">
          <Layers size={22} />
        </div>
        <div className="logo-text">
          <span className="logo-title">CampusPortal</span>
          <span className="logo-sub">DBMS Capstone</span>
        </div>
      </div>

      {/* Nav Section */}
      <div className="sidebar-nav">
        <div className="nav-section-title">
          {role === 'admin' ? 'Administration' : role === 'recruiter' ? 'Recruiter Portal' : 'Student Portal'}
        </div>

        {links.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer with Active User */}
      <div className="sidebar-footer">
        <div className="user-badge-card">
          <div className="avatar">
            {user?.profile?.full_name ? user.profile.full_name[0] : (user?.role === 'admin' ? 'A' : 'U')}
          </div>
          <div className="user-info">
            <span className="user-name">
              {user?.profile?.full_name || (user?.role === 'admin' ? 'Placement Admin' : user?.email)}
            </span>
            <span className="user-role-chip">{role}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', marginTop: '0.75rem', gap: '0.4rem', justifyContent: 'center' }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
