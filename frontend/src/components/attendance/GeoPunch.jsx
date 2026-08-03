import React, { useState,useEffect } from 'react';
import { MapPin, Clock, Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const EMPLOYEE_ID = 1;

export function GeoPunch() {
  const [status, setStatus] = useState('idle');
  const [punchType, setPunchType] = useState('IN');
  const [location, setLocation] = useState(null);
  const [recent, setRecent] = useState([]);

// Fetch All data
  const fetchRecent = async () => {
    const res = await fetch(
      `http://localhost:3000/api/attendance/recent/${EMPLOYEE_ID}`
    );
    const data = await res.json();
    setRecent(data);
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  // 

   const handlePunch = async () => {
    setStatus("locating");

    setTimeout(async () => {
      const location = { lat: 12.9716, lng: 77.5946 };

      await fetch("http://localhost:3000/api/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: EMPLOYEE_ID,
          punch_type: punchType,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      setStatus("idle");
      fetchRecent();
    }, 1000);
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
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${punchType === 'IN' ? 'bg-white text-blue-600' : 'bg-blue-700 text-blue-200'}`}>
              
              CHECK IN
            </button>
            <button
              onClick={() => setPunchType('OUT')}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${punchType === 'OUT' ? 'bg-white text-blue-600' : 'bg-blue-700 text-blue-200'}`}>
              
              CHECK OUT
            </button>
          </div>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          {status === 'idle' &&
          <div className="text-center space-y-6">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative">
                <MapPin className="text-blue-500 w-12 h-12" />
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">You are in Office Range</h3>
                <p className="text-slate-500 text-sm mt-1">Location: Downtown Branch (Radius: 50m)</p>
              </div>
              <button
              onClick={handlePunch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
              
                <Camera size={20} />
                Punch {punchType}
              </button>
            </div>
          }

          {status === 'locating' &&
          <div className="text-center py-10">
              <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Verifying GPS Location...</p>
            </div>
          }

          {status === 'success' &&
          <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600 w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Punch Successful!</h3>
                <p className="text-slate-500 text-sm mt-1">Time: {format(new Date(), 'hh:mm:ss a')}</p>
                <p className="text-slate-400 text-xs mt-1">Lat: 40.7128 • Lng: -74.0060</p>
              </div>
              <button
              onClick={() => setStatus('idle')}
              className="text-blue-600 font-medium hover:underline text-sm">
              
                Back to Home
              </button>
            </div>
          }

          {status === 'error' &&
          <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="text-red-600 w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Location Error</h3>
                <p className="text-slate-500 text-sm mt-1">You seem to be out of the allowed radius.</p>
              </div>
              <button
              onClick={() => setStatus('idle')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
              
                Try Again
              </button>
            </div>
          }
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-bold text-slate-700 mb-3 px-2">Recent Activity</h4>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {recent.map((index,i) =>
          <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{index.punchType}</p>
                  <p className="text-xs text-slate-500">{index.punch_time}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">On Time</span>
            </div>
          )}
        </div>
      </div>
    </div>);

}