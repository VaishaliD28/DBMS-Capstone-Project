import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Database, Play, Code, CheckCircle2, Table, Sparkles, BookOpen } from 'lucide-react';

export default function AdminSqlAnalyticsPage() {
  const [selectedKey, setSelectedKey] = useState('inner-join');
  const [queryData, setQueryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const queryDemos = [
    {
      key: 'inner-join',
      label: '1. INNER JOIN',
      concept: 'SQL INNER JOIN Operation',
      purpose: 'Combines approved Opportunities with matching Company and Recruiter tuples.'
    },
    {
      key: 'left-join',
      label: '2. LEFT JOIN',
      concept: 'SQL LEFT OUTER JOIN',
      purpose: 'Preserves all Student records, calculating application counts even if 0.'
    },
    {
      key: 'group-having',
      label: '3. GROUP BY & HAVING',
      concept: 'Aggregation & Filtering Groups',
      purpose: 'Groups students by department, computing average CGPAs with HAVING AVG(cgpa) >= 8.0.'
    },
    {
      key: 'subquery',
      label: '4. Subquery (Single-Row)',
      concept: 'Nested Subqueries',
      purpose: 'Evaluates an inner SELECT AVG(cgpa) and filters outer student records exceeding that scalar value.'
    },
    {
      key: 'multi-table-join',
      label: '5. Complex Multi-Table JOIN',
      concept: '5-Table Relational Linkage',
      purpose: 'Navigates Students -> Applications -> Opportunities -> Companies -> Recruiters.'
    }
  ];

  const runShowcaseQuery = async (key) => {
    setLoading(true);
    try {
      const res = await adminApi.getShowcaseQuery(key);
      if (res.success) {
        setQueryData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runShowcaseQuery(selectedKey);
  }, [selectedKey]);

  const currentDemo = queryDemos.find(d => d.key === selectedKey);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Database size={22} style={{ color: '#2563eb' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
            DBMS Capstone Demonstration
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Relational SQL Analytics Engine</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Interactive proof of core database concepts: INNER/LEFT JOINs, GROUP BY & HAVING, Nested Subqueries, and Complex Multi-Table Relational Queries.
        </p>
      </div>

      {/* Query Selector Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        {queryDemos.map((d) => {
          const isActive = selectedKey === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setSelectedKey(d.key)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: '9999px', padding: '0.45rem 1rem', whiteSpace: 'nowrap' }}
            >
              <Code size={14} />
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>

      {/* Query Specs Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.35rem',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe'
            }}>
              {currentDemo?.concept}
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.4rem' }}>
              {queryData?.description || currentDemo?.purpose}
            </h3>
          </div>

          <button
            onClick={() => runShowcaseQuery(selectedKey)}
            disabled={loading}
            className="btn btn-primary btn-sm"
          >
            <Play size={14} />
            <span>{loading ? 'Executing...' : 'Re-Execute Query'}</span>
          </button>
        </div>

        {/* Formatted SQL Code Box */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#38bdf8',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '0.85rem',
          padding: '1rem 1.25rem',
          borderRadius: '0.5rem',
          lineHeight: '1.6',
          overflowX: 'auto',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
        }}>
          <span style={{ color: '#94a3b8' }}>-- DBMS Capstone Live SQL Query:</span>
          <br />
          {queryData?.sql || 'SELECT * FROM ...'}
        </div>
      </div>

      {/* Query Results Table Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Table size={18} style={{ color: '#2563eb' }} />
            <h3 className="card-title">
              Query Result Set ({queryData?.rows?.length || 0} tuples returned)
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
            ● Execution Status: 200 OK (Live Database Results)
          </span>
        </div>

        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Executing relational query against database...</p>
        ) : !queryData?.rows || queryData.rows.length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No tuples returned.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  {Object.keys(queryData.rows[0]).map((col) => (
                    <th key={col}>{col.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryData.rows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx}>
                        {typeof val === 'number' ? (
                          <strong>{val}</strong>
                        ) : val === null || val === undefined ? (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    ))}
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
