import React, { useState } from 'react';
import { applicationApi } from '../services/api';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatusUpdateModal({ applicant, onClose, onSuccess }) {
  const [status, setStatus] = useState(applicant.status || 'Under Review');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const statuses = [
    { value: 'Applied', label: 'Applied' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Shortlisted', label: 'Shortlisted' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Selected', label: 'Selected (Extend Offer)' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await applicationApi.updateStatus(applicant.application_id || applicant.id, {
        status,
        remarks: remarks.trim() || `Candidate status changed to ${status}.`
      });

      if (res.success) {
        onSuccess(res);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update candidate status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
              Candidate Review: {applicant.roll_number}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {applicant.student_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label">New Application Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recruiter Remarks */}
          <div className="form-group">
            <label className="form-label">Recruiter Feedback / Remarks</label>
            <textarea
              className="form-control"
              placeholder="e.g. Cleared round 1 technical screen; Offer letter extended; or feedback on next steps..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              These remarks will be added to the student's timeline history and trigger an in-app notification.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <CheckCircle2 size={16} />
              <span>{saving ? 'Updating...' : 'Update Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
