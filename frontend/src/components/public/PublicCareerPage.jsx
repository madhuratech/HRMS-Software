import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, ChevronRight, ArrowRight, Building, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicCareerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  const API_URL = import.meta.env.VITE_HRMS_API_URL || '';

  const fetchPublicJobs = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/public/jobs`;
      const query = [];
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      if (department) query.push(`department=${encodeURIComponent(department)}`);
      if (query.length > 0) url += `?${query.join('&')}`;

      const res = await fetch(url, { cache: 'no-store', headers: { 'Pragma': 'no-cache' } });
      const data = await res.json();
      const jobList = Array.isArray(data) ? data : (data.data || data.jobs || []);
      setJobs(jobList);
    } catch (err) {
      console.error('Error loading public jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicJobs();
  }, [search, department]);

  return (
    <div style={{ fontFamily: '"Inter", -apple-system, sans-serif', background: '#F8FAFC', minHeight: '100vh', color: '#1E293B' }}>
      
      {/* Madhura Technologies Brand Header */}
      <header style={{ background: '#0F172A', color: '#FFFFFF', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#2563EB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
            M
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Madhura Technologies</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Career Portal & Opportunities</div>
          </div>
        </div>
        <div>
          <a href="https://madhuratech.com" target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'none', fontWeight: '500' }}>
            Main Website ↗
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '64px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Build Your Career with Madhura Technologies
          </h1>
          <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '32px' }}>
            Join our team of innovation drivers, software engineers, and digital specialists shaping the future of technology solutions.
          </p>

          {/* Search & Filter Bar */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '8px', display: 'flex', gap: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <Search size={18} color="#94A3B8" />
              <input 
                type="text" 
                placeholder="Search job title or skills..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px', border: 'none', outline: 'none', fontSize: '14px', color: '#1E293B' }}
              />
            </div>

            <select 
              value={department}
              onChange={e => setDepartment(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', color: '#475569', background: '#F8FAFC' }}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Open Roles Section */}
      <div style={{ maxWidth: '1100px', margin: '48px auto', padding: '0 24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px' }}>Open Positions</h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Explore active job opportunities and apply directly</p>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563EB', background: '#EFF6FF', padding: '6px 14px', borderRadius: '20px' }}>
            {jobs.length} Active Roles
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#64748B' }}>
            Loading job openings...
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '64px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <Building size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }}>No Positions Available</h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>There are currently no active job openings matching your search criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {jobs.map(job => (
              <div 
                key={job.id} 
                style={{ 
                  background: '#FFFFFF', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  border: '1px solid #E2E8F0', 
                  display: 'flex', 
                  justifySpace: 'between', 
                  alignItems: 'center', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  transition: 'transform 0.15s, box-shadow 0.15s'
                }}
              >
                <div style={{ flex: 1, paddingRight: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>{job.title}</h3>
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB' }}>
                      {job.employmentType}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748B', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} /> {job.department}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {job.experience}</span>
                  </div>

                  {job.skills && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {job.skills.split(',').slice(0, 5).map((skill, idx) => (
                        <span key={idx} style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Link 
                    to={`/career/job/${job.slug}`}
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '12px 20px', 
                      background: '#2563EB', 
                      color: '#FFFFFF', 
                      borderRadius: '10px', 
                      textDecoration: 'none', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                    }}
                  >
                    View Details & Apply <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '32px 24px', textAlign: 'center', fontSize: '13px', marginTop: '64px' }}>
        © {new Date().getFullYear()} Madhura Technologies. All rights reserved. Powered by Madhura HRMS ATS.
      </footer>

    </div>
  );
}
