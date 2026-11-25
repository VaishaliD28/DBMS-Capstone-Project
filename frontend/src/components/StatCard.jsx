import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={26} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{title}</span>
        {subtitle && (
          <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.2rem' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
