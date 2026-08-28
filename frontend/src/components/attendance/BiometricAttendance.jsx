import React, { useState } from 'react';
import { Search, Filter, Download, Upload, Monitor, Smartphone, Fingerprint, Activity, Clock, CheckCircle2, AlertTriangle, MoreVertical, Calendar as CalendarIcon, MapPin, ChevronDown } from 'lucide-react';

export default function BiometricAttendance() {
  const biometricData = [
    { id: '1', employee: 'Aarav Sharma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', device: 'Main Gate - Entry', checkIn: '09:05 AM', checkOut: '--', method: 'Fingerprint', status: 'Success' },
    { id: '2', employee: 'Neha Patel', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', device: 'IT Wing - Door 1', checkIn: '08:55 AM', checkOut: '06:05 PM', method: 'Face ID', status: 'Success' },
    { id: '3', employee: 'Rohan Mehta', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', device: 'Sales Dept - Entry', checkIn: '09:15 AM', checkOut: '06:30 PM', method: 'Fingerprint', status: 'Success' },
    { id: '4', employee: 'Priya Nair', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', device: 'Main Gate - Entry', checkIn: '09:45 AM', checkOut: '--', method: 'Card Swipe', status: 'Success' },
    { id: '5', employee: 'Karan Verma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026703d', device: 'Dev Wing - Door 2', checkIn: '09:10 AM', checkOut: '06:00 PM', method: 'Fingerprint', status: 'Failed' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success': return 'hrms-badge-active';
      case 'Failed': return 'hrms-badge-danger';
      default: return 'hrms-badge-inactive';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'Fingerprint': return <Fingerprint size={16} className="hrms-text-muted" />;
      case 'Face ID': return <Monitor size={16} className="hrms-text-muted" />;
      case 'Card Swipe': return <Activity size={16} className="hrms-text-muted" />;
      default: return <Smartphone size={16} className="hrms-text-muted" />;
    }
  };

  return (
    <div className="hrms-content">
      {/* Header and Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>May 20, 2024</span>
            <CalendarIcon size={16} style={{ color: '#64748b' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Locations</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Devices</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Filter size={16} /> Filter
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <button style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 24px', color: '#2952E3', fontWeight: '500', cursor: 'pointer' }}>Export Logs</button>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Total Check-ins</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2952E3', lineHeight: '1' }}>212</div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Total Check-outs</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', lineHeight: '1' }}>209</div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Failed Attempts</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', lineHeight: '1' }}>8</div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Devices Active</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', lineHeight: '1' }}>12</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            {/* Live Feed Table */}
            <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Live Attendance Feed</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
                {biometricData.map((log, index) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: index !== biometricData.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={log.avatar} alt={log.employee} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{log.employee}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>EMP00{log.id} - Office - Device {log.id}</span>
                      </div>
                    </div>
                    <span style={{ 
                      padding: '6px 16px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      backgroundColor: log.status === 'Failed' ? '#fff7ed' : '#f0fdf4',
                      color: log.status === 'Failed' ? '#ea580c' : '#16a34a' 
                    }}>
                      {log.status === 'Failed' ? 'Check-in (Late)' : 'Check-in'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Device Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="hrms-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 24px 0' }}>Device Summary</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative', width: '130px', height: '130px', borderRadius: '50%', background: 'conic-gradient(#0d9488 0% 83.3%, #f59e0b 83.3% 100%, #ef4444 100% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '90px', height: '90px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>12</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Total Devices</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d9488' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Active</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '16px' }}>10 (83.3%)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Offline</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '16px' }}>2 (16.7%)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Maintenance</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '16px' }}>0 (0%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hrms-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>Top Locations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Main Office</span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>142</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Branch Office</span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>38</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Remote Office</span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>22</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Client Site</span>
                    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
}
