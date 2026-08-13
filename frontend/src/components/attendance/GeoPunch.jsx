import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Camera, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { apiFetch } from '../../lib/api';

export function GeoPunch() {
  const [status, setStatus] = useState('idle'); // 'idle', 'locating', 'success', 'error'
  const [punchType, setPunchType] = useState('IN');
  const [coords, setCoords] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [recent, setRecent] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [elapsed, setElapsed] = useState('');

  const fetchRecent = async () => {
    try {
      const auth = localStorage.getItem('hrms_auth');
      let userId = 1;
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          if (parsed.user && parsed.user.id) userId = parsed.user.id;
        } catch (e) {}
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
        if (data.status === 'PUNCHED_IN') {
          setPunchType('OUT');
        } else {
          setPunchType('IN');
        }
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

  const checkIsEarly = () => {
    const now = new Date();
    const currentHr = now.getHours();
    const currentMin = now.getMinutes();
    const timeValue = currentHr * 60 + currentMin;
    const shiftEndValue = 18 * 60 + 30; // 06:30 PM is 18:30
    return timeValue < shiftEndValue;
  };

  const handleCheckOutClick = (isEarly) => {
    if (isEarly) {
      const confirmed = window.confirm("Are you sure you want to punch out before your scheduled shift ends?");
      if (!confirmed) return;
    }
    handlePunch('OUT');
  };

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
      timeout: 10000,
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
              time: new Date().toLocaleTimeString(),
              lat,
              lng,
              locationName: res.locationName,
              distance: res.distance
            });
            setStatus('success');
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
    if (userAgent.indexOf("MSIE") > -1 || !!document.documentMode) return "Internet Explorer";
    return "Unknown Browser";
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-center text-white">
          <div className="text-blue-100 text-sm font-medium mb-1">{format(new Date(), 'EEEE, MMMM do')}</div>
          <div className="text-4xl font-bold tracking-tight">{format(new Date(), 'HH:mm')}</div>
          {status === 'idle' && todayRecord?.status === 'NOT_PUNCHED' && (
            <div className="mt-4 flex justify-center gap-2">
              <button className="px-4 py-1 rounded-full text-xs font-bold transition-all bg-white text-blue-600">
                CHECK IN
              </button>
            </div>
          )}
          {status === 'idle' && todayRecord?.status === 'PUNCHED_IN' && (
            <div className="mt-4 flex justify-center gap-2">
              <button className="px-4 py-1 rounded-full text-xs font-bold transition-all bg-white text-blue-600">
                CHECK OUT
              </button>
            </div>
          )}
        </div>
        
        <div className="p-5 flex flex-col items-center">
          {status === 'idle' && todayRecord?.status === 'NOT_PUNCHED' && (
            <div className="text-center space-y-3 w-full">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative">
                <MapPin className="text-blue-500 w-8 h-8" />
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Geofenced Attendance Punch</h3>
                <p className="text-slate-500 text-xs mt-0.5">Requires browser GPS verification to record check-in/out.</p>
              </div>
              <button
                onClick={() => handlePunch('IN')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <Camera size={18} />
                Punch IN
              </button>
            </div>
          )}

          {status === 'idle' && todayRecord?.status === 'PUNCHED_IN' && (
            <div className="text-center space-y-3 w-full">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto relative">
                <MapPin className="text-green-500 w-8 h-8" />
                <div className="absolute inset-0 border-4 border-green-100 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Active Shift</h3>
                <div className="mt-2 text-xs text-slate-600 space-y-1 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="flex justify-between"><span>Punch In Time:</span> <b>{todayRecord.punchInTime}</b></p>
                  <p className="flex justify-between"><span>Working Hours:</span> <span className="font-mono text-blue-600 font-bold">{elapsed || '00:00:00'}</span></p>
                  <p className="flex justify-between"><span>Current Location:</span> <b>{todayRecord.locationName}</b></p>
                  <p className="flex justify-between"><span>Attendance Status:</span> <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded">{todayRecord.statusLabel}</span></p>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleCheckOutClick(false)}
                  disabled={checkIsEarly()}
                  title={checkIsEarly() ? "Cannot perform normal punch out before shift ends" : ""}
                  className={`w-full font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs ${checkIsEarly() ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 active:scale-95'}`}
                >
                  <Camera size={16} />
                  Punch OUT
                </button>
                <button
                  onClick={() => handleCheckOutClick(true)}
                  className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold py-2 rounded-xl border border-orange-200 transition-colors text-xs"
                >
                  Early Punch OUT
                </button>
              </div>
            </div>
          )}

          {status === 'idle' && todayRecord?.status === 'PUNCHED_OUT' && (
            <div className="text-center space-y-4 w-full">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Attendance Completed</h3>
                <div className="mt-3 text-xs text-slate-600 space-y-1 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="flex justify-between"><span>Punch In:</span> <b>{todayRecord.punchInTime}</b></p>
                  <p className="flex justify-between"><span>Punch Out:</span> <b>{todayRecord.punchOutTime}</b></p>
                  <p className="flex justify-between"><span>Working Hours:</span> <b>{todayRecord.workingHours}</b></p>
                  <p className="flex justify-between"><span>Status:</span> <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded">{todayRecord.statusLabel}</span></p>
                </div>
                <p className="text-green-600 text-xs font-semibold mt-3">✓ Attendance successfully recorded for today!</p>
              </div>
            </div>
          )}

          {status === 'locating' && (
            <div className="text-center py-6">
              <Loader2 className="animate-spin w-10 h-10 text-blue-600 mx-auto mb-3" />
              <p className="text-slate-600 text-xs font-medium">Verifying GPS Location...</p>
              <p className="text-slate-400 text-[11px] mt-1">Please allow browser location permissions if prompted.</p>
            </div>
          )}

          {status === 'success' && successInfo && (
            <div className="text-center space-y-4 w-full">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Punch Successful!</h3>
                <p className="text-slate-500 text-xs mt-1">Recorded: {punchType} at {successInfo.time}</p>
                <p className="text-slate-600 text-xs font-semibold mt-1">Location: {successInfo.locationName} ({successInfo.distance}m distance)</p>
                <p className="text-slate-400 text-[11px] mt-1">Lat: {successInfo.lat.toFixed(6)} • Lng: {successInfo.lng.toFixed(6)}</p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="w-full bg-blue-50 text-blue-600 font-semibold py-2.5 rounded-xl hover:bg-blue-100 transition-colors text-xs"
              >
                Done
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4 w-full">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Punch Rejected</h3>
                <p className="text-red-500 text-xs font-semibold mt-1">{errorMessage}</p>
                {coords && (
                  <p className="text-slate-400 text-[11px] mt-1">Captured Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
                )}
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors text-xs"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2 px-1">Recent Activity</h4>
        <div 
          className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-y-auto"
          style={{ maxHeight: '170px' }}
        >
          {recent.length === 0 ? (
            <div className="p-3 text-center text-slate-500 text-xs">No recent punch activity.</div>
          ) : (
            recent.map((item, i) => (
              <div key={i} className="p-2.5 px-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Clock size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-xs">Punch {item.punch_type}</p>
                    <p className="text-[11px] text-slate-500">{new Date(item.punch_time).toLocaleString()}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[11px] font-bold rounded">Success</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}