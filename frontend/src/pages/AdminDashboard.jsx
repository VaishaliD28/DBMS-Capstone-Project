import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  Award,
  Check,
  X,
  AlertCircle,
  BarChart3,
  PieChart,
  Sparkles
} from 'lucide-react';

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard({ setCurrentPage }) {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingOpps, setPendingOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async () => {
    try {
      const [statsRes, analyticsRes, pendingRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAnalytics(),
        adminApi.getPendingOpportunities()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (pendingRes.success && pendingRes.pending) setPendingOpps(pendingRes.pending);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproval = async (id, status) => {
    try {
      const res = await adminApi.updateOpportunityApproval(id, status);
      if (res.success) {
        setActionMessage(`Opportunity successfully ${status}!`);
        loadData();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Department Chart Data
  const deptLabels = analytics?.departmentStats?.map(d => d.department.replace('Engineering', 'Eng.')) || [];
  const deptPlacedData = analytics?.departmentStats?.map(d => d.placed_students) || [];
  const deptTotalData = analytics?.departmentStats?.map(d => d.total_students) || [];

  const deptChartData = {
    labels: deptLabels,
    datasets: [
      {
        label: 'Placed Students',
        data: deptPlacedData,
        backgroundColor: '#2563eb',
        borderRadius: 4
      },
      {
        label: 'Total Students',
        data: deptTotalData,
        backgroundColor: '#e2e8f0',
        borderRadius: 4
      }
    ]
  };

  // 2. Status Doughnut Data
  const statusLabels = analytics?.statusDistribution?.map(s => s.status) || [];
  const statusCounts = analytics?.statusDistribution?.map(s => s.count) || [];

  const statusColors = {
    'Applied': '#3b82f6',
    'Under Review': '#f59e0b',
    'Shortlisted': '#8b5cf6',
    'Interview': '#d97706',
    'Selected': '#10b981',
    'Rejected': '#ef4444'
  };

  const statusChartData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusCounts,
        backgroundColor: statusLabels.map(st => statusColors[st] || '#94a3b8'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // 3. Top Skills Data
  const skillLabels = analytics?.topSkills?.map(s => s.skill_name) || [];
  const skillDemands = analytics?.topSkills?.map(s => s.required_by_jobs) || [];

  const skillChartData = {
    labels: skillLabels,
    datasets: [
      {
        label: 'Job Demand Count',
        data: skillDemands,
        backgroundColor: '#7c3aed',
        borderRadius: 4
      }
    ]
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          University Placement Cell Administration
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
          Placement Analytics & Control Hub
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Real-time placement ratios, recruitment pipeline statistics, and administrative approval workflow.
        </p>
      </div>

      {actionMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {actionMessage}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={stats?.total_students || 0}
          subtitle={`Avg CGPA: ${stats?.campus_average_cgpa || '8.5'}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Partner Companies"
          value={stats?.total_companies || 0}
          subtitle="Corporate recruiters"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Active Opportunities"
          value={stats?.total_active_opportunities || 0}
          subtitle={`${stats?.total_pending_approvals || 0} pending approvals`}
          icon={Briefcase}
          color="amber"
        />
        <StatCard
          title="Total Applications"
          value={stats?.total_applications || 0}
          subtitle="Processed through portal"
          icon={FileText}
          color="rose"
        />
        <StatCard
          title="Placed Students"
          value={stats?.total_placed_students || 0}
          subtitle={`Campus Placement: ${stats?.placement_rate || 0}%`}
          icon={Award}
          color="green"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Department-wise Placements */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Department Placement Ratios</h3>
              <p className="card-desc">Placed candidates vs registered students</p>
            </div>
            <BarChart3 size={20} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ height: '260px' }}>
            <Bar
              data={deptChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
              }}
            />
          </div>
        </div>

        {/* Chart 2: Application Pipeline Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Application Status Distribution</h3>
              <p className="card-desc">Candidate funnel across hiring stages</p>
            </div>
            <PieChart size={20} style={{ color: '#7c3aed' }} />
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
              }}
            />
          </div>
        </div>

        {/* Chart 3: In-Demand Skills */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Top In-Demand Technical Skills</h3>
              <p className="card-desc">Frequently required skills across active company postings</p>
            </div>
            <Sparkles size={20} style={{ color: '#059669' }} />
          </div>
          <div style={{ height: '240px' }}>
            <Bar
              data={skillChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Pending Job Postings Approvals */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Pending Opportunity Approvals ({pendingOpps.length})</h2>
            <p className="card-desc">Review and approve company postings before they go live to students</p>
          </div>
        </div>

        {pendingOpps.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            <Check size={36} style={{ margin: '0 auto 0.75rem', color: '#10b981' }} />
            <p style={{ fontWeight: 600 }}>All postings are reviewed. No approvals pending.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Position Title</th>
                  <th>Company</th>
                  <th>Type & Mode</th>
                  <th>Salary / Stipend</th>
                  <th>Min CGPA</th>
                  <th>Recruiter</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOpps.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{opp.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{opp.category}</span>
                    </td>
                    <td>{opp.company_name}</td>
                    <td>
                      <span className={`badge badge-${opp.type === 'job' ? 'applied' : 'shortlisted'}`}>
                        {opp.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>({opp.work_mode})</span>
                    </td>
                    <td>
                      <strong style={{ color: '#059669' }}>{opp.salary_or_stipend}</strong>
                    </td>
                    <td>{opp.min_cgpa}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#334155' }}>{opp.recruiter_name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{opp.recruiter_email}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApproval(opp.id, 'approved')}
                          className="btn btn-success btn-sm"
                          title="Approve posting"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleApproval(opp.id, 'rejected')}
                          className="btn btn-danger btn-sm"
                          title="Reject posting"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
