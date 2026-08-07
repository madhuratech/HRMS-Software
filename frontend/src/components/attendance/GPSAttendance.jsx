import React, { useState, useEffect, useCallback } from 'react';
import {
  Filter, Navigation, MapPin, ChevronDown, RefreshCw, CalendarIcon
} from 'lucide-react';

// Geofence definitions (must match backend)
const GEOFENCES = [
  { id: 1, name: 'Main Headquarters',          lat: 12.9718, lng: 77.5945, radius: 100,  color: '#2952E3', bgColor: 'rgba(41,82,227,0.08)',  label: 'HQ (100m)' },
  { id: 2, name: 'Branch Office - Downtown',   lat: 12.9730, lng: 77.6190, radius: 150,  color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.06)', label: 'Branch (150m)' },
  { id: 3, name: 'Remote Office - Tech Hub',   lat: 12.9302, lng: 77.5315, radius: 200,  color: '#10b981', bgColor: 'rgba(16,185,129,0.06)', label: 'Tech Hub (200m)' },
  { id: 4, name: 'Client Site - Retail Center', lat: 13.0010, lng: 77.5725, radius: 250, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.06)',  label: 'Retail (250m)' },
];

// Convert lat/lng to map x/y percentage (approximate bounding box)
const LAT_MIN = 12.92, LAT_MAX = 13.01;
const LNG_MIN = 77.52, LNG_MAX = 77.64;

function toMapPos(lat, lng) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return { x: Math.min(Math.max(x, 3), 97), y: Math.min(Math.max(y, 3), 97) };
}

// Geofence radius → map pixel radius (very approximate)
function toMapRadius(radiusMeters) {
  const totalDist = (LNG_MAX - LNG_MIN) * 111320; // degrees to meters
  return (radiusMeters / totalDist) * 100; // as % of width
}

export default function GPSAttendance() {
  const [records, setRecords] = useState([]);
  const [geofences, setGeofences] = useState(GEOFENCES.map(z => ({ ...z, activeStaff: 0 })));
  const [kpis, setKpis] = useState({ totalCheckins: 0, onSite: 0, remote: 0, activeGeofences: 4 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoveredEmployee, setHoveredEmployee] = useState(null);

  const loadFeed = useCallback(() => {
    setLoading(true);
    fetch(`http://localhost:5001/api/attendance/gps-feed?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const cleanRecords = (data.records || []).map(r => ({
            ...r,
            avatar: r.avatar ? r.avatar.replace(/^\/\//, '/') : null
          }));
          setRecords(cleanRecords);
          setGeofences(data.geofences || GEOFENCES.map(z => ({ ...z, activeStaff: 0 })));
          setKpis(data.kpis || { totalCheckins: 0, onSite: 0, remote: 0, activeGeofences: 4 });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("GPS feed error:", err);
        setLoading(false);
      });
  }, [selectedDate]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const onSitePct = kpis.totalCheckins > 0
    ? ((kpis.onSite / kpis.totalCheckins) * 100).toFixed(1)
    : 0;
  const remotePct = kpis.totalCheckins > 0
    ? ((kpis.remote / kpis.totalCheckins) * 100).toFixed(1)
    : 0;
  const conicGradient = `conic-gradient(#10b981 0% ${onSitePct}%, #f59e0b ${onSitePct}% 100%)`;

  // Map dimensions: geofence x/y as percent
  const gfPositions = GEOFENCES.map(z => ({ ...z, pos: toMapPos(z.lat, z.lng) }));

  return (
    <div className="hrms-content">
      {/* Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ border: 'none', outline: 'none', color: '#475569', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '160px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Geofences</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Filter size={16} /> Filter
          </button>
        </div>
        <button onClick={loadFeed} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 20px', color: '#2952E3', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { label: 'Total Check-ins', value: kpis.totalCheckins, color: '#2952E3' },
              { label: 'On-Site Check-ins', value: kpis.onSite, color: '#10b981' },
              { label: 'Remote Check-ins', value: kpis.remote, color: '#f59e0b' },
              { label: 'Active Geofences', value: kpis.activeGeofences, color: '#8b5cf6' },
            ].map(k => (
              <div key={k.label} className="hrms-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>{k.label}</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: k.color, lineHeight: '1' }}>
                  {loading ? '—' : k.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            {/* Left: Map + Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Interactive Geofence Map */}
              <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Interactive Geofence Map</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Live monitoring of employee GPS locations within configured geofence zones</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['On-Site', 'Remote'].map(s => (
                      <span key={s} style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s === 'On-Site' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)', border: `2px solid ${s === 'On-Site' ? '#10b981' : '#f59e0b'}`, display: 'inline-block' }} />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Map Canvas */}
                <div style={{ height: '340px', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                  {/* Grid */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(#2952E3 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  {/* Roads */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', stroke: '#cbd5e1', strokeWidth: 3, fill: 'none', opacity: 0.35 }}>
                    <path d="M0 100 Q200 120 400 80 T800 150" />
                    <path d="M150 0 Q180 200 120 340" />
                    <path d="M500 0 Q480 180 550 340" />
                    <path d="M0 280 L800 220" stroke="#cbd5e1" strokeWidth="4" />
                    <path d="M0 170 Q300 160 700 200" />
                  </svg>

                  {/* Geofence Circles */}
                  {gfPositions.map(z => {
                    const rPct = toMapRadius(z.radius);
                    return (
                      <div key={z.id} style={{
                        position: 'absolute',
                        left: `${z.pos.x}%`, top: `${z.pos.y}%`,
                        width: `${rPct * 3}%`, height: `${rPct * 5}%`,
                        minWidth: '80px', minHeight: '80px',
                        borderRadius: '50%',
                        backgroundColor: z.bgColor,
                        border: `1px dashed ${z.color}`,
                        transform: 'translate(-50%, -50%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1
                      }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: z.color, opacity: 0.8 }}>{z.label}</span>
                      </div>
                    );
                  })}

                  {/* Employee Pins */}
                  {records.map(emp => {
                    if (!emp.lat || !emp.lng) return null;
                    const pos = toMapPos(emp.lat, emp.lng);
                    const onSite = emp.status === 'On-Site';
                    const initials = emp.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={emp.employee_id}
                        title={`${emp.name} – ${emp.location}`}
                        onMouseEnter={() => setHoveredEmployee(emp)}
                        onMouseLeave={() => setHoveredEmployee(null)}
                        style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer', zIndex: 10 }}
                      >
                        <div style={{ position: 'relative' }}>
                          {/* Avatar or Initials circle */}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            border: `2.5px solid ${onSite ? '#10b981' : '#f59e0b'}`,
                            overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                            background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: '700', color: '#475569'
                          }}>
                            {emp.avatar
                              ? <img src={emp.avatar} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                              : initials}
                          </div>
                          {/* Status dot */}
                          <div style={{
                            position: 'absolute', bottom: '-3px', right: '-3px',
                            backgroundColor: onSite ? '#10b981' : '#f59e0b',
                            borderRadius: '50%', width: '13px', height: '13px',
                            border: '2px solid #fff'
                          }} />
                        </div>
                        {/* Hover Tooltip */}
                        {hoveredEmployee?.employee_id === emp.employee_id && (
                          <div style={{
                            position: 'absolute', bottom: '44px', left: '50%', transform: 'translateX(-50%)',
                            backgroundColor: '#1e293b', color: '#fff', fontSize: '11px', fontWeight: '600',
                            padding: '6px 10px', borderRadius: '6px', whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 20
                          }}>
                            {emp.name}<br />
                            <span style={{ fontWeight: '400', color: '#94a3b8' }}>{emp.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Compass */}
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#fff', padding: '7px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <Navigation size={18} style={{ color: '#64748b' }} />
                  </div>
                </div>
              </div>

              {/* Live GPS Attendance Feed */}
              <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Live GPS Attendance Feed</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{records.length} records today</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
                  {loading ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading GPS feed...</div>
                  ) : records.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                      No GPS attendance records found for {selectedDate}.
                    </div>
                  ) : (
                    records.map((log, idx) => {
                      const onSite = log.status === 'On-Site';
                      const initials = log.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <div key={log.employee_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: idx !== records.length - 1 ? '1px solid #f1f5f9' : 'none', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                              width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                              background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: '700', color: '#475569', overflow: 'hidden'
                            }}>
                              {log.avatar
                                ? <img src={log.avatar} alt={log.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                : initials}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{log.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={11} /> {log.location}
                                </span>
                                <span style={{ color: '#e2e8f0' }}>•</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{log.coordinates}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>In: {log.checkIn}</span>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Out: {log.checkOut}</span>
                            </div>
                            <span style={{
                              padding: '5px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                              backgroundColor: onSite ? '#f0fdf4' : '#fffbeb',
                              color: onSite ? '#16a34a' : '#d97706'
                            }}>
                              {log.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Donut Distribution */}
              <div className="hrms-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>Location Distribution</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    position: 'relative', width: '120px', height: '120px', flexShrink: 0,
                    borderRadius: '50%', background: loading ? '#e2e8f0' : conicGradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ width: '82px', height: '82px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>{kpis.totalCheckins}</span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>Active</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'On-Site', count: kpis.onSite, pct: onSitePct, color: '#10b981' },
                      { label: 'Remote', count: kpis.remote, pct: remotePct, color: '#f59e0b' },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{s.label}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '15px' }}>{s.count} ({s.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Geofenced Zones */}
              <div className="hrms-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>Active Geofenced Zones</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {geofences.map(z => (
                    <div key={z.id} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', backgroundColor: '#fafbfd' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{z.name}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#2952E3', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>r = {z.radius}m</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                        <span>Lat/Lng: {z.lat.toFixed(4)}° N, {z.lng.toFixed(4)}° E</span>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>{z.activeStaff} Staff</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
