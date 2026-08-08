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
  const [locationName, setLocationName] = useState('');

  const fetchRecent = async () => {
    try {
      // Decode user from local storage token fallback or use direct recent endpoint
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

  useEffect(() => {
    fetchRecent();
  }, []);

  const handlePunch = () => {
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
              punch_type: punchType,
              latitude: lat,
              longitude: lng,
              device_info: navigator.userAgent,
              browser: getBrowserName(),
              ip_address: '' // Handled by server
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
            fetchRecent();
          } else {
            setErrorMessage(res.message || "You are outside the allowed office location. Attendance cannot be recorded.");
            setStatus('error');
          }
        } catch (err) {
          console.error(err);
          setErrorMessage("Error submitting punch request. Please check your network connection.");
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
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setPunchType('IN')}
              disabled={status === 'locating'}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${punchType === 'IN' ? 'bg-white text-blue-600' : 'bg-blue-700 text-blue-200 hover:bg-blue-800'}`}>
              CHECK IN
            </button>
            <button
              onClick={() => setPunchType('OUT')}
              disabled={status === 'locating'}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${punchType === 'OUT' ? 'bg-white text-blue-600' : 'bg-blue-700 text-blue-200 hover:bg-blue-800'}`}>
              CHECK OUT
            </button>
          </div>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          {status === 'idle' && (
            <div className="text-center space-y-6 w-full">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative">
                <MapPin className="text-blue-500 w-12 h-12" />
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Geofenced Attendance Punch</h3>
                <p className="text-slate-500 text-sm mt-1">Requires browser GPS verification to record check-in/out.</p>
              </div>
              <button
                onClick={handlePunch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Punch {punchType}
              </button>
            </div>
          )}

          {status === 'locating' && (
            <div className="text-center py-10">
              <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Verifying GPS Location...</p>
              <p className="text-slate-400 text-xs mt-1">Please allow browser location permissions if prompted.</p>
            </div>
          )}

          {status === 'success' && successInfo && (
            <div className="text-center space-y-6 w-full">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600 w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Punch Successful!</h3>
                <p className="text-slate-500 text-sm mt-1">Recorded: {punchType} at {successInfo.time}</p>
                <p className="text-slate-600 text-sm font-semibold mt-1">Location: {successInfo.locationName} ({successInfo.distance}m distance)</p>
                <p className="text-slate-400 text-xs mt-2">Lat: {successInfo.lat.toFixed(6)} • Lng: {successInfo.lng.toFixed(6)}</p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="w-full bg-blue-50 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-6 w-full">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="text-red-600 w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Punch Rejected</h3>
                <p className="text-red-500 text-sm font-semibold mt-2">{errorMessage}</p>
                {coords && (
                  <p className="text-slate-400 text-xs mt-2">Captured Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
                )}
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-bold text-slate-700 mb-3 px-2">Recent Activity</h4>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-40 overflow-y-auto">
          {recent.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No recent punch activity.</div>
          ) : (
            recent.map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Punch {item.punch_type}</p>
                    <p className="text-xs text-slate-500">{new Date(item.punch_time).toLocaleString()}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">Success</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}