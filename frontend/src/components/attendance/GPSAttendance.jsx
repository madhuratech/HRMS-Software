import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Upload, Monitor, Smartphone, Activity, Clock, CheckCircle2, AlertTriangle, MoreVertical, Calendar as CalendarIcon, MapPin, ChevronDown, Navigation, Map, ShieldAlert, RefreshCw } from 'lucide-react';

const mockLogs = [
  { id: '1', employee: 'Aarav Sharma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', location: 'Main Headquarters', checkIn: '09:05 AM', checkOut: '--', coordinates: '12.9718° N, 77.5945° E', status: 'On-Site' },
  { id: '2', employee: 'Neha Patel', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', location: 'Branch Office - Downtown', checkIn: '08:55 AM', checkOut: '06:05 PM', coordinates: '12.9841° N, 77.6200° E', status: 'On-Site' },
  { id: '3', employee: 'Rohan Mehta', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', location: 'Remote Office - Tech Hub', checkIn: '09:15 AM', checkOut: '06:30 PM', coordinates: '12.9302° N, 77.5315° E', status: 'On-Site' },
  { id: '4', employee: 'Priya Nair', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', location: 'Outside Geofence', checkIn: '09:45 AM', checkOut: '--', coordinates: '12.9550° N, 77.5810° E', status: 'Remote' },
  { id: '5', employee: 'Karan Verma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026703d', location: 'Client Site - Retail Center', checkIn: '09:10 AM', checkOut: '06:00 PM', coordinates: '13.0010° N, 77.5725° E', status: 'On-Site' },
];

export default function GPSAttendance() {
  const [activeGeofences, setActiveGeofences] = useState([
    { id: '1', name: 'Main Headquarters', lat: '12.9716° N', lng: '77.5946° E', radius: '100m', activeStaff: 142 },
    { id: '2', name: 'Branch Office - Downtown', lat: '12.9842° N', lng: '77.6201° E', radius: '150m', activeStaff: 38 },
    { id: '3', name: 'Remote Office - Tech Hub', lat: '12.9304° N', lng: '77.5312° E', radius: '200m', activeStaff: 22 },
    { id: '4', name: 'Client Site - Retail Center', lat: '13.0012° N', lng: '77.5724° E', radius: '250m', activeStaff: 10 },
  ]);

  const [gpsLogs, setGpsLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/app/dashboard/stats') // use activity as fallback
      .then(res => res.json())
      .then(data => {
        if (data.recentActivity && data.recentActivity.length > 0) {
          const mapped = data.recentActivity.map((d, index) => ({
            id: String(index + 1),
            employee: d.employee_name,
            avatar: `https://i.pravatar.cc/150?u=EMP00${index + 1}`,
            location: d.punch_type === 'IN' ? 'Main Headquarters' : 'Branch Office - Downtown',
            checkIn: new Date(d.punch_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            checkOut: '--',
            coordinates: '12.9718° N, 77.5945° E',
            status: 'On-Site'
          }));
          setGpsLogs(mapped);
        } else {
          setGpsLogs(mockLogs);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setGpsLogs(mockLogs);
        setLoading(false);
      });
  }, []);

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
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Geofences</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Filter size={16} /> Filter
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <button style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 24px', color: '#2952E3', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh Logs
          </button>
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
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>On-Site Check-ins</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', lineHeight: '1' }}>198</div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Remote Check-ins</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', lineHeight: '1' }}>14</div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Active Geofences</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', lineHeight: '1' }}>4</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            {/* Live GPS Feed & Interactive Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Interactive Map Mockup */}
              <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Interactive Geofence Map</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Live monitoring of employee locations inside configured geofence ranges</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.25)', border: '2px solid #10b981', display: 'inline-block' }}></span> On-Site
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.25)', border: '2px solid #f59e0b', display: 'inline-block' }}></span> Remote
                    </span>
                  </div>
                </div>
                
                {/* Visual Map Layout */}
                <div style={{ height: '350px', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Grid overlay to mimic maps */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#2952E3 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                  
                  {/* Map Roads / Elements Mockup */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', stroke: '#cbd5e1', strokeWidth: '3', fill: 'none', opacity: 0.4 }}>
                    <path d="M 0 100 Q 200 120 400 80 T 800 150" />
                    <path d="M 150 0 Q 180 200 120 400" />
                    <path d="M 500 0 Q 480 180 550 400" />
                    <path d="M 0 280 L 800 220" stroke="#cbd5e1" strokeWidth="4" />
                  </svg>

                  {/* Geofence Circles */}
                  {/* HQ */}
                  <div style={{ position: 'absolute', left: '35%', top: '30%', width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'rgba(41, 82, 227, 0.08)', border: '1px dashed #2952E3', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#2952E3', opacity: 0.7 }}>HQ (100m)</span>
                  </div>
                  {/* Branch Office */}
                  <div style={{ position: 'absolute', left: '70%', top: '60%', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.06)', border: '1px dashed #8b5cf6', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#8b5cf6', opacity: 0.7 }}>Branch (150m)</span>
                  </div>

                  {/* Employee Pins on Map */}
                  {/* Aarav Sharma (HQ On-Site) */}
                  <div style={{ position: 'absolute', left: '32%', top: '28%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 10 }} title="Aarav Sharma - On-Site">
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid #10b981', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <img src="https://i.pravatar.cc/100?u=a042581f4e29026024d" alt="Aarav" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#10b981', borderRadius: '50%', width: '14px', height: '14px', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Neha Patel (Branch On-Site) */}
                  <div style={{ position: 'absolute', left: '68%', top: '55%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 10 }} title="Neha Patel - On-Site">
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid #10b981', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <img src="https://i.pravatar.cc/100?u=a042581f4e29026704d" alt="Neha" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#10b981', borderRadius: '50%', width: '14px', height: '14px', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Priya Nair (Outside Geofence - Remote) */}
                  <div style={{ position: 'absolute', left: '15%', top: '75%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 10 }} title="Priya Nair - Out of Bounds">
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid #f59e0b', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <img src="https://i.pravatar.cc/100?u=a048581f4e29026701d" alt="Priya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#f59e0b', borderRadius: '50%', width: '14px', height: '14px', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Compass/GPS UI element */}
                  <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: '#fff', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyItems: 'center', color: '#64748b', cursor: 'pointer' }}><Navigation size={18} style={{ margin: 'auto' }} /></div>
                  </div>
                </div>
              </div>

              {/* Live Attendance Feed */}
              <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Live GPS Attendance Feed</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
                  {gpsLogs.map((log, index) => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: index !== gpsLogs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={log.avatar} alt={log.employee} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{log.employee}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {log.location}
                            </span>
                            <span style={{ color: '#cbd5e1', fontSize: '12px' }}>•</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{log.coordinates}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>In: {log.checkIn}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Out: {log.checkOut}</span>
                        </div>
                        <span style={{ 
                          padding: '6px 16px', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          backgroundColor: log.status === 'Remote' ? '#fffbeb' : '#f0fdf4',
                          color: log.status === 'Remote' ? '#d97706' : '#16a34a' 
                        }}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Panel - Geofences & Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Geofence Status Distribution */}
              <div className="hrms-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 24px 0' }}>Location Distribution</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative', width: '130px', height: '130px', borderRadius: '50%', background: 'conic-gradient(#10b981 0% 93.4%, #f59e0b 93.4% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '90px', height: '90px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>212</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Active Users</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>On-Site</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '16px' }}>198 (93.4%)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Remote</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '16px' }}>14 (6.6%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configure Geofences list */}
              <div className="hrms-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Active Geofenced Zones</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeGeofences.map(zone => (
                    <div key={zone.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', backgroundColor: '#fafbfd' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{zone.name}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#2952E3', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>r = {zone.radius}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        <span>Lat/Lng: {zone.lat}, {zone.lng}</span>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>{zone.activeStaff} Staff</span>
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
