import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Camera, CheckCircle, AlertTriangle, Loader2, Navigation, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { apiFetch } from '../../lib/api';

export function GeoPunch() {
  const [status, setStatus] = useState('idle'); // 'idle', 'locating', 'success', 'error'
  const [coords, setCoords] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [recent, setRecent] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRecent = async () => {
    try {
      const auth = localStorage.getItem('hrms_auth');
      let userId = 11;
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          const userObj = parsed.user || parsed;
          if (userObj && userObj.id) userId = userObj.id;
        } catch (e) { }
      }
      const data = await apiFetch(`/attendance/recent/${userId}`);
      if (Array.isArray(data)) {
        setRecent(data);
      }
    } catch (e) {
      console.error("Failed to fetch recent attendance logs", e);
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const data = await apiFetch('/attendance/today-status');
      if (data && data.success) {
        setTodayRecord(data);
      }
    } catch (e) {
      console.error("Failed to fetch today status", e);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    fetchRecent();
  }, []);

  // Update working hours elapsed timer for PUNCHED_IN employees
  useEffect(() => {
    if (todayRecord?.status !== 'PUNCHED_IN' || !todayRecord?.checkInTimeRaw) return;

    const interval = setInterval(() => {
      const start = new Date(todayRecord.checkInTimeRaw);
      const now = new Date();
      const diffMs = now - start;
      if (diffMs < 0) {
        setElapsed('00:00:00');
        return;
      }
      const hrs = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
      const mins = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
      const secs = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
      setElapsed(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [todayRecord]);

  const handlePunch = (type) => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      setStatus('error');
      return;
    }

    setStatus("locating");
    setErrorMessage('');

    const options = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await apiFetch('/attendance/punch', {
            method: 'POST',
            body: JSON.stringify({
              punch_type: type,
              latitude: lat,
              longitude: lng,
              device_info: navigator.userAgent,
              browser: getBrowserName(),
              ip_address: ''
            })
          });

          if (res.success) {
            setSuccessInfo({
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
              lat,
              lng,
              locationName: res.locationName || 'HQ Office Geofence',
              distance: res.distance || 0,
              type
            });
            setStatus('success');
            window.dispatchEvent(new CustomEvent('attendance-updated', { detail: { type } }));
            await fetchTodayStatus();
            await fetchRecent();
          } else {
            setErrorMessage(res.message || "You are outside the permitted office location.");
            setStatus('error');
          }
        } catch (err) {
          console.error(err);
          setErrorMessage(err.message || "Error submitting punch request. Please check your network connection.");
          setStatus('error');
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage("GPS permission denied. Please enable location permissions in your browser settings to punch attendance.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMessage("Location information is unavailable. Ensure your device GPS is active.");
        } else if (error.code === error.TIMEOUT) {
          setErrorMessage("GPS location request timed out. Please try again in an area with better signal.");
        } else {
          setErrorMessage("Could not retrieve GPS coordinates. Please ensure location services are enabled.");
        }
        setStatus('error');
      },
      options
    );
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) return "Google Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Apple Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Mozilla Firefox";
    return "Web Browser";
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }} className="max-w-md mx-auto space-y-5">

      {/* Premium Main Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden'
      }}>

        {/* Dynamic Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
          padding: '24px',
          color: '#FFFFFF',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '13px', color: '#DBEAFE', fontWeight: '600', letterSpacing: '0.02em', marginBottom: '4px' }}>
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {format(currentTime, 'hh:mm:ss')} <span style={{ fontSize: '16px', fontWeight: '600', opacity: 0.8 }}>{format(currentTime, 'a')}</span>
          </div>

          {/* Top Status Pill */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
            <span style={{
              background: todayRecord?.status === 'PUNCHED_IN' ? '#10B981' : todayRecord?.status === 'PUNCHED_OUT' ? '#3B82F6' : 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              backdropFilter: 'blur(4px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFFFFF' }} className="animate-ping" />
              {todayRecord?.status === 'PUNCHED_IN' ? 'ACTIVE SHIFT' : todayRecord?.status === 'PUNCHED_OUT' ? 'COMPLETED FOR TODAY' : 'READY TO CHECK IN'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '24px' }}>

          {/* Idle State: Not Punched Yet */}
          {status === 'idle' && (todayRecord?.status === 'NOT_PUNCHED' || !todayRecord?.status) && (
            <div className="text-center space-y-4">
              <div style={{ width: '72px', height: '72px', background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '4px solid #DBEAFE' }}>
                <MapPin className="text-blue-600" size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Geofenced Punch In</h3>
                <p className="text-xs text-slate-500 mt-1">Requires browser GPS verification to mark attendance.</p>
              </div>
              <button
                onClick={() => handlePunch('IN')}
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)'
                }}
                className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm hover:opacity-95 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Camera size={18} /> Punch IN Now
              </button>
            </div>
          )}

          {/* Idle State: Currently Punched In -> Ready for Punch Out */}
          {status === 'idle' && todayRecord?.status === 'PUNCHED_IN' && (
            <div className="space-y-5">

              {/* Shift Stats Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Punch In Time:</span>
                  <strong className="text-slate-900 font-bold">{todayRecord.punchInTime || '09:12 AM'}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Working Hours:</span>
                  <strong className="text-blue-600 font-mono text-sm font-extrabold">{elapsed}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Geofence Location:</span>
                  <strong className="text-slate-900 font-medium truncate max-w-[180px]">{todayRecord.locationName || 'HQ Office'}</strong>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 mt-2 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md">
                    {todayRecord.statusLabel || 'PUNCHED IN'}
                  </span>
                </div>
              </div>

              {/* Punch Out Action Button */}
              <button
                onClick={() => handlePunch('OUT')}
                style={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  boxShadow: '0 8px 20px -4px rgba(220, 38, 38, 0.35)'
                }}
                className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm hover:opacity-95 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Camera size={18} /> Punch OUT Now
              </button>
            </div>
          )}

          {/* Idle State: Punched Out Completed */}
          {status === 'idle' && todayRecord?.status === 'PUNCHED_OUT' && (
            <div className="text-center space-y-4">
              <div style={{ width: '64px', height: '64px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '4px solid #D1FAE5' }}>
                <CheckCircle className="text-emerald-600" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Attendance Completed</h3>
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-left">
                  <div className="flex justify-between"><span>Punch In:</span> <strong className="text-slate-800">{todayRecord.punchInTime}</strong></div>
                  <div className="flex justify-between"><span>Punch Out:</span> <strong className="text-slate-800">{todayRecord.punchOutTime}</strong></div>
                  <div className="flex justify-between"><span>Working Hours:</span> <strong className="text-blue-600 font-bold">{todayRecord.workingHours}</strong></div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span>Status:</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md">{todayRecord.statusLabel || 'Completed'}</span>
                  </div>
                </div>
                <p className="text-emerald-600 text-xs font-bold mt-3">✓ Attendance successfully recorded for today!</p>
              </div>
            </div>
          )}

          {/* Locating GPS State */}
          {status === 'locating' && (
            <div className="text-center py-6 space-y-3">
              <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Verifying GPS Location...</h4>
                <p className="text-xs text-slate-400 mt-1">Acquiring accurate GPS coordinates from your device.</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && successInfo && (
            <div className="text-center space-y-4">
              <div style={{ width: '64px', height: '64px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <CheckCircle className="text-emerald-600" size={36} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Punch {successInfo.type} Successful!</h3>
                <p className="text-xs text-slate-500 mt-1">Recorded at {successInfo.time}</p>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 text-left space-y-1">
                  <div><strong>Location:</strong> {successInfo.locationName}</div>
                  <div><strong>Coordinates:</strong> {successInfo.lat.toFixed(5)}, {successInfo.lng.toFixed(5)}</div>
                </div>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div style={{ width: '64px', height: '64px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <AlertTriangle className="text-rose-600" size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Punch Rejected</h3>
                <p className="text-xs text-rose-600 font-semibold mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Recent Activity List */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(15,23,42,0.03)'
      }}>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Punch Logs</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recent.length === 0 ? (
            <div className="text-center py-3 text-xs text-slate-400">No recent punch activity.</div>
          ) : (
            recent.map((item, idx) => (
              <div key={idx} className="pl-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${item.punch_type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.punch_type}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Punch {item.punch_type}</span>
                    <span className="text-[11px] text-slate-400">{new Date(item.punch_time).toLocaleString()}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600">
                  Recorded
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default GeoPunch;