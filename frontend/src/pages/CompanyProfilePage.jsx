import React, { useState, useEffect } from 'react';
import { recruiterApi } from '../services/api';
import { Building2, User, Check, AlertCircle, Save } from 'lucide-react';

export default function CompanyProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    website: '',
    industry: '',
    description: '',
    location: '',
    logoUrl: '',
    contactEmail: ''
  });

  const [recruiterForm, setRecruiterForm] = useState({
    fullName: '',
    phone: '',
    designation: ''
  });

  const [savingCompany, setSavingCompany] = useState(false);
  const [savingRecruiter, setSavingRecruiter] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = async () => {
    try {
      const res = await recruiterApi.getProfile();
      if (res.success) {
        setProfileData(res);
        if (res.company) {
          setCompanyForm({
            name: res.company.name || '',
            website: res.company.website || '',
            industry: res.company.industry || '',
            description: res.company.description || '',
            location: res.company.location || '',
            logoUrl: res.company.logo_url || '',
            contactEmail: res.company.contact_email || ''
          });
        }
        if (res.recruiter) {
          setRecruiterForm({
            fullName: res.recruiter.full_name || '',
            phone: res.recruiter.phone || '',
            designation: res.recruiter.designation || ''
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await recruiterApi.updateCompany(companyForm);
      if (res.success) {
        setMessage({ type: 'success', text: 'Company profile updated successfully!' });
        loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update company.' });
    } finally {
      setSavingCompany(false);
    }
  };

  const handleRecruiterSubmit = async (e) => {
    e.preventDefault();
    setSavingRecruiter(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await recruiterApi.updateProfile(recruiterForm);
      if (res.success) {
        setMessage({ type: 'success', text: 'Recruiter personal profile updated successfully!' });
        loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update personal details.' });
    } finally {
      setSavingRecruiter(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Company & Recruiter Profile</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage your organization's public placement profile and university recruiting representative details.
        </p>
      </div>

      {message.text && (
        <div style={{
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#047857' : '#b91c1c',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Company Profile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Building2 size={24} style={{ color: '#2563eb' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Company Information</h2>
          </div>

          <form onSubmit={handleCompanySubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Industry Sector</label>
                <input
                  type="text"
                  className="form-control"
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Official Website</label>
                <input
                  type="url"
                  className="form-control"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Headquarters / Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact / Campus Hiring Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={companyForm.contactEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Logo Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={companyForm.logoUrl}
                  onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">About the Company</label>
              <textarea
                className="form-control"
                rows={4}
                value={companyForm.description}
                onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingCompany}
              style={{ marginTop: '0.5rem' }}
            >
              <Save size={16} />
              <span>{savingCompany ? 'Saving Company...' : 'Save Company Profile'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Recruiter Representative Profile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <User size={24} style={{ color: '#2563eb' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Representative</h2>
          </div>

          <form onSubmit={handleRecruiterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={recruiterForm.fullName}
                onChange={(e) => setRecruiterForm({ ...recruiterForm, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                value={recruiterForm.designation}
                onChange={(e) => setRecruiterForm({ ...recruiterForm, designation: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={recruiterForm.phone}
                onChange={(e) => setRecruiterForm({ ...recruiterForm, phone: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-outline"
              disabled={savingRecruiter}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              <Save size={16} />
              <span>{savingRecruiter ? 'Saving...' : 'Update Details'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
