import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentApi, opportunityApi } from '../services/api';
import ApplyModal from '../components/ApplyModal';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function JobDetailsPage({ opportunity, onBack, setCurrentPage }) {
  const { user, role } = useAuth();
  const [oppDetails, setOppDetails] = useState(opportunity);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      if (!opportunity?.id) return;
      try {
        const res = await opportunityApi.getById(opportunity.id);
        if (res.success && res.opportunity) {
          setOppDetails(res.opportunity);
        }

        if (role === 'student') {
          const [elRes, profRes] = await Promise.all([
            studentApi.checkEligibility(opportunity.id),
            studentApi.getProfile()
          ]);

          if (elRes.success) setEligibilityData(elRes);
          if (profRes.success && profRes.profile) setStudentProfile(profRes.profile);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [opportunity?.id, role]);

  const handleApplySuccess = () => {
    // Refresh eligibility state
    if (opportunity?.id) {
      studentApi.checkEligibility(opportunity.id).then(res => {
        if (res.success) setEligibilityData(res);
      });
    }
  };

  if (!oppDetails) {
    return (
      <div className="page-wrapper">
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Browse
        </button>
        <p>No opportunity selected.</p>
      </div>
    );
  }

  const isEligible = eligibilityData?.eligibility?.isEligible;
  const hasApplied = eligibilityData?.eligibility?.hasAlreadyApplied;
  const appDetails = eligibilityData?.eligibility?.applicationDetails;
  const matchInfo = eligibilityData?.skillsAnalysis;

  return (
    <div className="page-wrapper">
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} /> Back to Postings
      </button>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Job Description & Requirements */}
        <div>
          {/* Header Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {oppDetails.company_logo ? (
                  <img
                    src={oppDetails.company_logo}
                    alt={oppDetails.company_name}
                    style={{ width: '64px', height: '64px', borderRadius: '0.75rem', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={32} />
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>{oppDetails.company_name}</span>
                    {oppDetails.company_website && (
                      <a href={oppDetails.company_website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{oppDetails.title}</h1>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`badge badge-${oppDetails.type === 'job' ? 'applied' : 'shortlisted'}`} style={{ textTransform: 'uppercase' }}>
                {oppDetails.type}
              </span>
            </div>

            {/* Quick Specs Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #f1f5f9'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Location</span>
                <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>{oppDetails.location}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Work Mode</span>
                <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>{oppDetails.work_mode}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Salary / Stipend</span>
                <strong style={{ fontSize: '0.875rem', color: '#059669' }}>{oppDetails.salary_or_stipend}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Deadline</span>
                <strong style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                  {new Date(oppDetails.deadline).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.85rem' }}>Role Description</h3>
            <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {oppDetails.description}
            </p>
          </div>

          {/* Requirements Section */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.85rem' }}>Required Skills & Qualifications</h3>
            <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '1.25rem' }}>
              {oppDetails.requirements}
            </p>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Specific Skill Tags:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {oppDetails.required_skills?.map((sk) => (
                <span
                  key={sk.skill_id}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    border: '1px solid #bfdbfe'
                  }}
                >
                  {sk.name || sk.skill_name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Smart Skill Matching & Dynamic Eligibility Checker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Box */}
          <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
            {hasApplied ? (
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Application Submitted</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Current Status: <strong className="badge badge-applied">{appDetails?.status || 'Applied'}</strong>
                </p>
                <button
                  onClick={() => setCurrentPage('my-applications')}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                >
                  Track in My Applications
                </button>
              </div>
            ) : role === 'student' ? (
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                  Ready to Apply?
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Your profile and verified resume will be attached to this application.
                </p>
                <button
                  onClick={() => setShowApplyModal(true)}
                  disabled={!isEligible}
                  className={`btn ${isEligible ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%' }}
                >
                  {isEligible ? 'Apply for this Position' : 'Ineligible to Apply'}
                </button>
                {!isEligible && (
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', marginTop: '0.5rem' }}>
                    Criteria requirement not fulfilled (check below).
                  </span>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Sign in as a student to apply for this opportunity.
                </p>
              </div>
            )}
          </div>

          {/* ADVANCED FEATURE 1: Smart Skill Matching Card */}
          {role === 'student' && matchInfo && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={20} style={{ color: '#2563eb' }} />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Smart Skill Match Analysis</h3>
              </div>

              {/* Progress Bar & Percentage */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>Skills Compatibility</span>
                  <strong style={{ color: matchInfo.matchPercentage >= 80 ? '#059669' : '#2563eb' }}>
                    {matchInfo.matchPercentage}%
                  </strong>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${matchInfo.matchPercentage}%`,
                    height: '100%',
                    backgroundColor: matchInfo.matchPercentage >= 80 ? '#10b981' : '#2563eb',
                    borderRadius: '9999px'
                  }} />
                </div>
              </div>

              {/* Matched Skills */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                  ✓ Matched Skills ({matchInfo.matchedSkills?.length || 0}):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {matchInfo.matchedSkills?.map(sk => (
                    <span key={sk.id} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.35rem', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {matchInfo.missingSkills?.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    Missing Required Skills ({matchInfo.missingSkills.length}):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {matchInfo.missingSkills.map(sk => (
                      <span key={sk.id} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.35rem', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADVANCED FEATURE 2: Dynamic Eligibility Checker Card */}
          {role === 'student' && eligibilityData?.eligibility && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldCheck size={20} style={{ color: '#059669' }} />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Eligibility Criteria</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                {/* CGPA Check */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>CGPA Threshold (Min {eligibilityData.eligibility.requiredCgpa})</span>
                  {eligibilityData.eligibility.cgpaEligible ? (
                    <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={15} /> {eligibilityData.eligibility.studentCgpa} (Met)
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <XCircle size={15} /> {eligibilityData.eligibility.studentCgpa} (Failed)
                    </span>
                  )}
                </div>

                {/* Graduation Year Check */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Passing Batch ({eligibilityData.eligibility.requiredGradYear || 'Any'})</span>
                  {eligibilityData.eligibility.gradYearEligible ? (
                    <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={15} /> {eligibilityData.eligibility.studentGradYear} (Eligible)
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <XCircle size={15} /> Ineligible
                    </span>
                  )}
                </div>

                {/* Deadline Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Application Status</span>
                  {!eligibilityData.eligibility.isDeadlinePassed ? (
                    <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={15} /> Open for Submissions
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <XCircle size={15} /> Deadline Passed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          opportunity={oppDetails}
          studentProfile={studentProfile}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
