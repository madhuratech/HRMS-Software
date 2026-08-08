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

  // Google Maps references
  const mapContainerRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const mapInstance = useRef(null);
  const mapObjects = useRef([]); // tracks circles/markers to clear them on update

  // Load Google Maps dynamically via CDN
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setGoogleMapsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=weekly';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    document.body.appendChild(script);
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

  // Initialize and update Google Map
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainerRef.current) return;

    const maps = window.google.maps;
    const defaultCenter = { lat: 12.9716, lng: 77.5946 };

    if (!mapInstance.current) {
      mapInstance.current = new maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true
      });
    }

    // Clear existing markers & circles
    mapObjects.current.forEach(obj => obj.setMap(null));
    mapObjects.current = [];

    const bounds = new maps.LatLngBounds();
    let hasBounds = false;

    // 1. Draw Office Geofences
    geofences.forEach(gf => {
      const center = { lat: gf.lat, lng: gf.lng };

      const circle = new maps.Circle({
        strokeColor: '#2563EB',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.15,
        map: mapInstance.current,
        center: center,
        radius: gf.radius
      });
      mapObjects.current.push(circle);

      // Office Marker (Label/Pin)
      const marker = new maps.Marker({
        position: center,
        map: mapInstance.current,
        title: gf.name,
        icon: {
          path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });
      mapObjects.current.push(marker);

      bounds.extend(center);
      hasBounds = true;
    });

    // 2. Draw Employee Pins
    records.forEach(r => {
      if (!r.lat || !r.lng) return;

      const isInside = r.status === 'On-Site';
      const markerColor = isInside ? '#10B981' : '#F59E0B'; // On-Site is Green, Remote is Yellow/Orange
      const position = { lat: r.lat, lng: r.lng };

      const empMarker = new maps.Marker({
        position: position,
        map: mapInstance.current,
        title: r.name,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });
      mapObjects.current.push(empMarker);

      // Bind InfoWindow popup
      const infoWindow = new maps.InfoWindow({
        content: `
          <div style="font-family:sans-serif; padding:4px">
            <b style="font-size:13px; color:#1e293b">${r.name}</b><br/>
            <span style="font-size:11px; color:#64748b">Location: ${r.location}</span><br/>
            <span style="font-size:11px; color:#64748b">In: ${r.checkIn} | Out: ${r.checkOut}</span><br/>
            <span style="display:inline-block; margin-top:4px; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700; background:${markerColor}15; color:${markerColor}">${r.status} (${r.distance}m)</span>
          </div>
        `
      });

      empMarker.addListener('click', () => {
        infoWindow.open(mapInstance.current, empMarker);
      });

      bounds.extend(position);
      hasBounds = true;
    });

    // Auto adjust bounds
    if (hasBounds && mapInstance.current) {
      mapInstance.current.fitBounds(bounds);
    }
  }, [googleMapsLoaded, geofences, records]);

  const onSitePct = kpis.totalCheckins > 0
    ? ((kpis.onSite / kpis.totalCheckins) * 100).toFixed(1)
    : 0;
  const remotePct = kpis.totalCheckins > 0
    ? ((kpis.remote / kpis.totalCheckins) * 100).toFixed(1)
    : 0;
  const conicGradient = `conic-gradient(#10b981 0% ${onSitePct}%, #f59e0b ${onSitePct}% 100%)`;

  return (
    <div className="hrms-content">
      {/* Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px' }}>
            <CalendarIcon size={16} style={{ color: '#64748b' }} />
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowPunchModal(true)} style={{ background: '#2563EB', border: 'none', borderRadius: '8px', padding: '8px 20px', color: '#FFF', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> Punch Attendance
          </button>
          <button onClick={loadFeed} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 20px', color: '#2952E3', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh Logs
          </button>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { label: 'Total Check-ins', value: kpis.totalCheckins, color: '#2952E3' },
              { label: 'On-Site Check-ins', value: kpis.onSite, color: '#10b981' },
              { label: 'Remote Check-ins', value: kpis.remote, color: '#f59e0b' },
              { label: 'Active Geofence Locations', value: kpis.activeGeofences, color: '#8b5cf6' },
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
            
            {/* Map & Live GPS Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Interactive Geofence Map */}
              <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Interactive Geofence Map</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Live monitoring of employee positions and configured geofence ranges</p>
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
                  {!googleMapsLoaded && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13, zIndex: 10 }}>
                      Loading Google Maps module...
                    </div>
                  )}
                  <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
                </div>
              </div>

              {/* Live GPS Attendance Feed */}
              <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Live GPS Attendance Feed</h3>
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
                    records.map((log, idx) => {
                      const onSite = log.status === 'On-Site';
                      return (
                        <div key={log.employee_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: idx !== records.length - 1 ? '1px solid #f1f5f9' : 'none', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <EmployeeAvatar name={log.name} photoUrl={log.avatar} size={42} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{log.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={11} /> {log.location} ({log.distance}m away)
                                </span>
                                <span style={{ color: '#e2e8f0' }}>•</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{log.coordinates}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
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
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                onClick={() => {
                                  if (log.lat && log.lng && mapInstance.current) {
                                    mapInstance.current.setCenter({ lat: log.lat, lng: log.lng });
                                    mapInstance.current.setZoom(16);
                                    mapContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }}
                                title="Locate on Map"
                                style={{ background: 'none', cursor: 'pointer', color: '#2563eb', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid #dbeafe', backgroundColor: '#f8faff' }}
                              >
                                <Navigation size={14} style={{ transform: 'rotate(45deg)' }} />
                              </button>
                              <button 
                                onClick={() => {
                                  localStorage.setItem('selectedEmployeeId', log.employee_id);
                                  navigate('/employees/profile');
                                }}
                                title="View Profile"
                                style={{ background: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}
                              >
                                <Eye size={14} />
                              </button>
                            </div>
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
              
              {/* Location Distribution */}
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
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>Active</span>
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

              {/* Active Geofenced Zones list */}
              <div className="hrms-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>Active Geofenced Zones</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {geofences.map(z => (
                    <div key={z.id} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', backgroundColor: '#fafbfd' }}>
                      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{z.name}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#2952E3', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>r = {z.radius}m</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                        <span>Lat/Lng: {z.lat.toFixed(4)}°, {z.lng.toFixed(4)}°</span>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>{z.activeStaff} Checked-in</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {showPunchModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #E5E7EB', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: '24px 24px 16px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', scrollbarWidth: 'thin' }}>
            <button
              onClick={() => { setShowPunchModal(false); loadFeed(); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18, fontWeight: '700', zIndex: 1300 }}
            >
              ✕
            </button>
            <GeoPunch />
          </div>
        </div>
      )}
    </div>
  );
}
