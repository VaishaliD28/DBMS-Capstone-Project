import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { opportunityApi } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';
import { Search, Filter, Briefcase, GraduationCap, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function BrowseOpportunitiesPage({ initialType = '', setCurrentPage, setSelectedOpportunity }) {
  const { role } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState(initialType); // '' | 'job' | 'internship'
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [sortByMatch, setSortByMatch] = useState(true);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = { status: 'approved' };
      if (search) params.search = search;
      if (type) params.type = type;
      if (workMode) params.work_mode = workMode;
      if (location) params.location = location;
      if (minCgpa) params.min_cgpa = minCgpa;

      const res = await opportunityApi.getAll(params);
      if (res.success && res.opportunities) {
        let list = res.opportunities;
        if (sortByMatch && role === 'student') {
          list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }
        setOpportunities(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search, type, workMode, location, minCgpa, sortByMatch]);

  const handleSelectJob = (opp) => {
    setSelectedOpportunity(opp);
    setCurrentPage('job-details');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          {type === 'internship' ? 'Explore Internships' : type === 'job' ? 'Explore Full-Time Jobs' : 'Browse Opportunities'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Discover verified university placement opportunities with real-time skill matching and eligibility check.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, company, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types (Jobs & Internships)</option>
              <option value="job">Full-time Jobs</option>
              <option value="internship">Internships</option>
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <select
              className="form-control"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
            >
              <option value="">All Work Modes</option>
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <select
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
        </div>

        {/* Second Row: Quick Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Showing <strong>{opportunities.length}</strong> available positions
          </span>

          {role === 'student' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', cursor: 'pointer', fontWeight: 600, color: '#2563eb' }}>
              <input
                type="checkbox"
                checked={sortByMatch}
                onChange={(e) => setSortByMatch(e.target.checked)}
              />
              <Sparkles size={15} />
              <span>Sort by Smart Skill Match %</span>
            </label>
          )}
        </div>
      </div>

      {/* Grid of Opportunities */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          Loading opportunities...
        </div>
      ) : opportunities.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <Briefcase size={40} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.5rem' }}>No opportunities matched your search</h3>
          <p style={{ fontSize: '0.875rem' }}>Try clearing filters or adjusting your search keywords.</p>
          <button
            onClick={() => { setSearch(''); setType(''); setWorkMode(''); setLocation(''); }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '1rem' }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={handleSelectJob}
              userRole={role}
            />
          ))}
        </div>
      )}
    </div>
  );
}
