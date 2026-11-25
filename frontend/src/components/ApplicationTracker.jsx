import React from 'react';
import { Check, Clock, Eye, Calendar, Award, XCircle } from 'lucide-react';

export default function ApplicationTracker({ status = 'Applied', latestRemark, history = [] }) {
  const steps = [
    { key: 'Applied', label: 'Applied', icon: Clock },
    { key: 'Under Review', label: 'Under Review', icon: Eye },
    { key: 'Shortlisted', label: 'Shortlisted', icon: Check },
    { key: 'Interview', label: 'Interview', icon: Calendar },
    { key: 'Selected', label: 'Selected', icon: Award }
  ];

  const isRejected = status === 'Rejected';

  // Find index of current status
  const currentStepIndex = isRejected
    ? 1 // Show as branched at review stage
    : steps.findIndex(s => s.key === status);

  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  // Calculate width for the progress bar
  const progressPercent = isRejected ? 35 : (activeIndex / (steps.length - 1)) * 100;

  return (
    <div style={{ padding: '1rem 0' }}>
      <div className="timeline-tracker">
        {/* Background track line */}
        <div className="timeline-line" />
        
        {/* Filled progress line */}
        <div 
          className="timeline-progress" 
          style={{ 
            width: `calc(${progressPercent}% * 0.85)`,
            backgroundColor: isRejected ? '#ef4444' : '#2563eb'
          }} 
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = !isRejected && idx < activeIndex;
          const isCurrent = !isRejected && idx === activeIndex;

          let circleClass = 'step-circle';
          if (isCompleted) circleClass += ' completed';
          else if (isCurrent) circleClass += ' active';

          return (
            <div key={step.key} className="timeline-step">
              <div className={circleClass}>
                {isCompleted ? <Check size={16} /> : <Icon size={15} />}
              </div>
              <span className={`step-label ${isCurrent ? 'current' : ''}`}>
                {step.label}
              </span>
            </div>
          );
        })}

        {isRejected && (
          <div className="timeline-step" style={{ marginLeft: '0.5rem' }}>
            <div className="step-circle rejected">
              <XCircle size={16} />
            </div>
            <span className="step-label" style={{ color: '#ef4444', fontWeight: 700 }}>
              Rejected
            </span>
          </div>
        )}
      </div>

      {/* Recruiter Remarks Box */}
      {latestRemark && (
        <div style={{
          marginTop: '1.25rem',
          backgroundColor: isRejected ? '#fef2f2' : '#f8fafc',
          border: `1px solid ${isRejected ? '#fecaca' : '#e2e8f0'}`,
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          fontSize: '0.825rem'
        }}>
          <span style={{ fontWeight: '700', color: isRejected ? '#991b1b' : '#334155' }}>Latest Feedback: </span>
          <span style={{ color: isRejected ? '#b91c1c' : '#475569' }}>{latestRemark}</span>
        </div>
      )}
    </div>
  );
}
