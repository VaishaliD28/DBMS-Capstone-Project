import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Search, GraduationCap, CheckCircle2, XCircle, ShieldAlert, Award } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (department) params.department = department;

      const res = await adminApi.getStudents(params);
      if (res.success && res.students) {
        setStudents(res.students);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminApi.updateStudentStatus(userId, newStatus);
      if (res.success) {
        setActionMsg(`Student account status changed to ${newStatus}.`);
        fetchStudents();
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Student Accounts</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Inspect academic credentials, placement offers, and manage account statuses.
        </p>
      </div>

      {actionMsg && (
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
          {actionMsg}
        </div>
      )}

      {/* Search and Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name, roll number, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Computer Science and Engineering">Computer Science (CSE)</option>
              <option value="Information Technology">Information Technology (IT)</option>
              <option value="Electronics and Communication">Electronics & Comm (ECE)</option>
              <option value="Mechanical Engineering">Mechanical</option>
              <option value="Civil Engineering">Civil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading students...</p>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <GraduationCap size={36} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
            <p>No students found matching this criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Grad Year</th>
                  <th>Applications</th>
                  <th>Offers</th>
                  <th>Account Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{st.full_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{st.email}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{st.roll_number}</span>
                    </td>
                    <td>{st.department}</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{st.cgpa}</strong>
                    </td>
                    <td>{st.graduation_year}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>{st.total_applications || 0}</span>
                    </td>
                    <td>
                      {st.offers_received > 0 ? (
                        <span style={{
                          color: '#047857',
                          backgroundColor: '#ecfdf5',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Award size={12} /> {st.offers_received} Placed
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>0</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${st.account_status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                        {st.account_status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(st.user_id, st.account_status)}
                        className={`btn btn-sm ${st.account_status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        style={{ padding: '0.25rem 0.6rem' }}
                      >
                        {st.account_status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
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
