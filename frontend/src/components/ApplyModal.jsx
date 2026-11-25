import React, { useState } from 'react';
import { applicationApi, studentApi } from '../services/api';
import { X, Send, Sparkles, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ApplyModal({ opportunity, studentProfile, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentResumeUrl, setCurrentResumeUrl] = useState(studentProfile?.resume_url || '/uploads/sample-resume.pdf');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    setError('');

    try {
      const res = await studentApi.uploadResume(formData);
      if (res.success) {
        setCurrentResumeUrl(res.resumeUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await applicationApi.apply({
        opportunityId: opportunity.id,
        coverLetter,
        resumeUrl: currentResumeUrl
      });

      if (res.success) {
        onSuccess(res);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        {/* Header */}
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
              Applying for {opportunity.company_name}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {opportunity.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* Match Score Banner */}
        {opportunity.matchScore !== undefined && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: '#16a34a' }} />
              <div>
                <span style={{ fontWeight: '700', color: '#15803d', fontSize: '0.85rem' }}>
                  Smart Skill Match: {opportunity.matchScore}%
                </span>
                <p style={{ fontSize: '0.75rem', color: '#166534', margin: 0 }}>
                  Your profile skills match this job's requirements.
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#15803d' }}>
              Eligible
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Resume Selection */}
          <div className="form-group">
            <label className="form-label">Resume to Attach (PDF)</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} style={{ color: '#2563eb' }} />
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                    {studentProfile?.full_name || 'My'}_Resume.pdf
                  </span>
                  <a
                    href={currentResumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: '#2563eb', display: 'block' }}
                  >
                    Preview current resume
                  </a>
                </div>
              </div>

              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                <Upload size={14} />
                <span>{uploadingResume ? 'Uploading...' : 'Replace PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingResume}
                />
              </label>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="form-group">
            <label className="form-label">Statement of Interest / Cover Letter</label>
            <textarea
              className="form-control"
              placeholder="Highlight your key achievements, relevant projects, and why you are excited for this opportunity..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || uploadingResume}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
