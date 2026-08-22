import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Filter, Navigation, MapPin, ChevronDown, RefreshCw, CalendarIcon,
  CheckCircle2, XCircle, Clock, Eye
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { GeoPunch } from './GeoPunch';
import { useNavigate } from 'react-router-dom';
import EmployeeAvatar from '../employee/EmployeeAvatar';

export default function GPSAttendance() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [kpis, setKpis] = useState({ totalCheckins: 0, onSite: 0, remote: 0, activeGeofences: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPunchModal, setShowPunchModal] = useState(false);

  // Map references - Using Leaflet map engine for 100% clean rendering
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstance = useRef(null);
  const mapObjects = useRef([]);

  // Dynamically load Leaflet library
  useEffect(() => {
    let isMounted = true;

    if (window.L) {
      setMapLoaded(true);
      return;
    }

    // Insert Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css';
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }

    // Insert Leaflet JS
    const existingScript = document.getElementById('leaflet-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (isMounted) setMapLoaded(true);
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      if (isMounted) setMapLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, []);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/attendance/gps-feed?date=${selectedDate}`);
      if (data.success) {
        setRecords(data.records || []);
        setGeofences(data.geofences || []);
        setKpis(data.kpis || { totalCheckins: 0, onSite: 0, remote: 0, activeGeofences: 0 });
      }
    } catch (err) {
      console.error("GPS feed error:", err);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Render Map using Leaflet OpenStreetMap Engine
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.L) return;

    const L = window.L;
    const defaultCenter = [11.0130, 76.9567]; // Default Tamil Nadu / HQ coordinates

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true
      });

      // Add CartoDB Voyager Tile Layer for crisp, modern styling
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }).addTo(mapInstance.current);
    }

    // Clear existing map layers
    mapObjects.current.forEach(obj => obj.remove());
    mapObjects.current = [];

    const boundsGroup = [];

    // 1. Render Geofence Office Zones (Circles & Markers)
    geofences.forEach(gf => {
      if (!gf.lat || !gf.lng) return;

      const circle = L.circle([gf.lat, gf.lng], {
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.18,
        weight: 2,
        radius: gf.radius || 300
      }).addTo(mapInstance.current);

      circle.bindPopup(`
        <div style="font-family:sans-serif; padding:4px">
          <b style="font-size:13px; color:#1E293B">${gf.name}</b><br/>
          <span style="font-size:11px; color:#2563EB; font-weight:600">Geofence Radius: ${gf.radius}m</span><br/>
          <span style="font-size:11px; color:#64748B">Center: ${gf.lat.toFixed(4)}°, ${gf.lng.toFixed(4)}°</span>
        </div>
      `);
      mapObjects.current.push(circle);

      // Office Pin Marker
      const officeMarker = L.circleMarker([gf.lat, gf.lng], {
        radius: 7,
        fillColor: '#2563EB',
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 1
      }).addTo(mapInstance.current);

      officeMarker.bindPopup(`<b>${gf.name}</b>`);
      mapObjects.current.push(officeMarker);

      boundsGroup.push([gf.lat, gf.lng]);
    });

    // 2. Render Live Employee Attendance Pins
    records.forEach(r => {
      if (!r.lat || !r.lng) return;

      const isInside = r.status === 'On-Site';
      const color = isInside ? '#10B981' : '#F59E0B';

      const empMarker = L.circleMarker([r.lat, r.lng], {
        radius: 9,
        fillColor: color,
        color: '#FFFFFF',
        weight: 3,
        fillOpacity: 1
      }).addTo(mapInstance.current);

      empMarker.bindPopup(`
        <div style="font-family:sans-serif; padding:4px">
          <b style="font-size:13px; color:#0F172A">${r.name}</b><br/>
          <span style="font-size:11px; color:#475569">Location: ${r.location || 'Logged Location'}</span><br/>
          <span style="font-size:11px; color:#475569">Time: ${r.checkIn || r.checkOut || '—'}</span><br/>
          <span style="display:inline-block; margin-top:6px; padding:3px 8px; border-radius:6px; font-size:10px; font-weight:700; background:${color}20; color:${color}">
            ${r.status || 'On-Site'} (${r.distance || 0}m from office)
          </span>
        </div>
      `);

      mapObjects.current.push(empMarker);
      boundsGroup.push([r.lat, r.lng]);
    });

    // Auto-adjust camera bounds to encompass all geofences and pins
    if (boundsGroup.length > 0) {
      mapInstance.current.fitBounds(boundsGroup, { padding: [40, 40], maxZoom: 15 });
    }
  }, [mapLoaded, geofences, records]);

  const onSitePct = kpis.totalCheckins > 0
    ? ((kpis.onSite / kpis.totalCheckins) * 100).toFixed(1)
    : 0;

  return (
    <div className="hrms-content">
      {/* Header */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>GPS Location & Geofencing Attendance</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Real-time spatial tracking & geofence validation for mobile check-ins</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="hrms-primary-btn"
            onClick={() => setShowPunchModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563EB' }}
          >
            <Navigation size={16} /> Punch Attendance
          </button>
          <button 
            className="hrms-secondary-btn"
            onClick={loadFeed}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Logs
          </button>
        </div>
      </div>

      {/* Date Filter & Control Bar */}
      <div className="hrms-card hrms-mb-6" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px' }}>
            <CalendarIcon size={16} color="#64748B" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px' }}>
            <MapPin size={16} color="#64748B" />
            <select style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
              <option value="ALL">All Geofences</option>
              {geofences.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="hrms-secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="hrms-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Total Check-ins</p>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#2563EB', margin: '8px 0 0' }}>{kpis.totalCheckins}</h2>
        </div>
        <div className="hrms-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>On-Site Check-ins</p>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#10B981', margin: '8px 0 0' }}>{kpis.onSite}</h2>
        </div>
        <div className="hrms-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Remote Check-ins</p>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#F59E0B', margin: '8px 0 0' }}>{kpis.remote}</h2>
        </div>
        <div className="hrms-card" style={{ padding: '18px 20px', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Active Geofence Locations</p>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#8B5CF6', margin: '8px 0 0' }}>{kpis.activeGeofences || geofences.length}</h2>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Right Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Interactive Map */}
        <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Interactive Geofence Map</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Live monitoring of employee positions and configured geofence ranges</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.25)', border: '2px solid #10b981', display: 'inline-block' }} /> On-Site (Inside Geofence)
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.25)', border: '2px solid #f59e0b', display: 'inline-block' }} /> Remote (Outside Geofence)
              </span>
            </div>
          </div>

          <div style={{ height: '380px', backgroundColor: '#f1f5f9', position: 'relative' }}>
            {!mapLoaded && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13, zIndex: 10 }}>
                Loading Interactive Map engine...
              </div>
            )}
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
          </div>
        </div>

        {/* Right Side Stats Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Location Distribution */}
          <div className="hrms-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Location Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', position: 'relative' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '12px solid #10B981', borderTopColor: '#F59E0B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{kpis.totalCheckins}</span>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Active</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> On-Site
                </span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{kpis.onSite} ({onSitePct}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} /> Remote
                </span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{kpis.remote} ({(100 - onSitePct).toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Active Geofenced Zones list */}
          <div className="hrms-card" style={{ padding: '20px', borderRadius: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '14px' }}>Active Geofenced Zones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '200px' }}>
              {geofences.map(gf => (
                <div key={gf.id} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{gf.name} <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: 600 }}>r = {gf.radius}m</span></div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: 2 }}>Lat/Lng: {gf.lat?.toFixed(4)}°, {gf.lng?.toFixed(4)}°</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>0 Checked-in</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live GPS Attendance Feed Table */}
      <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Live GPS Attendance Feed</h3>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{records.length} records today</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading GPS logs...</div>
          ) : records.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No GPS attendance records found for {selectedDate}.
            </div>
          ) : (
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check IN</th>
                  <th>Check OUT</th>
                  <th>Working Hours</th>
                  <th>Location / Coordinates</th>
                  <th>Geofence Status</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <EmployeeAvatar name={r.name} photoUrl={r.avatar} size={32} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{r.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{r.dept}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>
                      {r.checkIn || '—'}
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 700, color: r.checkOut && r.checkOut !== '--' ? '#2563EB' : '#94A3B8' }}>
                      {r.checkOut || '--'}
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      {r.workingHours || '--'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      <div style={{ fontWeight: 600 }}>{r.location || 'HQ Location'}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}</div>
                    </td>
                    <td>
                      <span className={`hrms-badge ${r.status === 'On-Site' ? 'hrms-badge-active' : 'hrms-badge-warning'}`}>
                        {r.status || 'On-Site'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} /> GPS Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Punch Attendance Modal */}
      {showPunchModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#FFF', borderRadius: 16, width: '100%', maxWidth: 460,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #E2E8F0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', flexShrink: 0
            }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F172A' }}>GPS Mobile Punch</h3>
              <button onClick={() => setShowPunchModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              <GeoPunch />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
