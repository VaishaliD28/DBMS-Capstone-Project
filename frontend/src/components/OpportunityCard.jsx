import React from 'react';
import { Building2, MapPin, DollarSign, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export default function OpportunityCard({ opportunity, onSelect, userRole }) {
  const {
    id,
    title,
    type,
    category,
    location,
    work_mode,
    salary_or_stipend,
    deadline,
    company_name,
    company_logo,
    required_skills = [],
    matchScore,
    applicationStatus
  } = opportunity;

  // Format deadline date
  const formattedDeadline = new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Header Row: Company & Badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {company_logo ? (
            <img
              src={company_logo}
              alt={company_name}
              style={{ width: '48px', height: '48px', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid #e2e8f0' }}
            />
          ) : (
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.5rem',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700'
            }}>
              <Building2 size={24} />
            </div>
          )}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{company_name}</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.3 }}>{title}</h3>
          </div>
        </div>

        {/* Type Badge */}
        <span style={{
          fontSize: '0.725rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          backgroundColor: type === 'job' ? '#eff6ff' : '#f5f3ff',
          color: type === 'job' ? '#1e40af' : '#6d28d9',
          border: `1px solid ${type === 'job' ? '#bfdbfe' : '#ddd6fe'}`
        }}>
          {type}
        </span>
      </div>

      {/* Meta Specs: Location, Salary, Deadline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.825rem', color: '#475569', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={15} style={{ color: '#94a3b8' }} />
          <span>{location} ({work_mode})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <DollarSign size={15} style={{ color: '#94a3b8' }} />
          <span style={{ fontWeight: '600', color: '#0f172a' }}>{salary_or_stipend}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={15} style={{ color: '#94a3b8' }} />
          <span>Due: {formattedDeadline}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Category:</span>
          <span style={{ fontWeight: '500' }}>{category}</span>
        </div>
      </div>

      {/* Skills Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {required_skills.slice(0, 4).map((sk) => (
          <span
            key={sk.skill_id}
            style={{
              fontSize: '0.725rem',
              fontWeight: '500',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '0.15rem 0.5rem',
              borderRadius: '0.35rem'
            }}
          >
            {sk.name || sk.skill_name}
          </span>
        ))}
        {required_skills.length > 4 && (
          <span style={{ fontSize: '0.725rem', color: '#94a3b8', alignSelf: 'center' }}>
            +{required_skills.length - 4} more
          </span>
        )}
      </div>

      {/* Footer Row: Smart Match Score & Action */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '0.85rem',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        {/* Smart Skill Match Badge */}
        {userRole === 'student' && matchScore !== null && matchScore !== undefined ? (
          <div className={`match-score-badge ${matchScore >= 80 ? 'match-score-high' : matchScore >= 60 ? 'match-score-med' : 'match-score-low'}`}>
            <Sparkles size={14} />
            <span>{matchScore}% Match</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
            Min CGPA: <strong>{opportunity.min_cgpa}</strong>
          </span>
        )}

        {/* Status or View Details Button */}
        {applicationStatus ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className={`badge badge-${applicationStatus.toLowerCase().replace(' ', '-')}`}>
              <CheckCircle2 size={13} />
              {applicationStatus}
            </span>
            <button onClick={() => onSelect(opportunity)} className="btn btn-outline btn-sm">
              Details
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSelect(opportunity)}
            className="btn btn-primary btn-sm"
          >
            View & Apply
          </button>
        )}
      </div>
    </div>
  );
}
