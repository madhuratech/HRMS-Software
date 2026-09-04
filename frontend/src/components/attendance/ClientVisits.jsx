import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../lib/api';
import { MapPin, Navigation, Camera, CheckCircle2, Clock, XCircle, Play, Square } from 'lucide-react';

const LiveTrackingMap = ({ visitId, onClose }) => {
  const [data, setData] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const polylineRef = useRef(null);
  const markerRef = useRef(null);

  const fetchData = async () => {
    const res = await apiFetch(`/client-visits/${visitId}/track`);
    if (res.success) {
      setData(res);
      updateMap(res.points);
    }
  };

  const updateMap = (points) => {
    if (!mapInstance.current || !points || points.length === 0) return;
    const latlngs = points.map(p => [p.latitude, p.longitude]);
    
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latlngs);
    } else {
      polylineRef.current = window.L.polyline(latlngs, { color: '#2563EB', weight: 4, dashArray: '5, 10' }).addTo(mapInstance.current);
    }
    
    const lastPoint = latlngs[latlngs.length - 1];
    if (markerRef.current) {
      markerRef.current.setLatLng(lastPoint);
    } else {
      markerRef.current = window.L.circleMarker(lastPoint, { radius: 8, fillColor: '#10B981', color: '#FFF', weight: 2, fillOpacity: 1 }).addTo(mapInstance.current);
    }
    
    // Use try-catch because bounds might be invalid if points are too close
    try {
      mapInstance.current.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40], maxZoom: 16 });
    } catch (e) {}
  };

  useEffect(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;
    mapInstance.current = window.L.map(mapRef.current).setView([0,0], 13);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: 'HRMS Maps'
    }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    fetchData();
    const int = setInterval(fetchData, 10000); // 10s poll
    return () => clearInterval(int);
  }, [visitId]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#FFF', width: '100%', maxWidth: '800px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '80vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color="#2563EB"/> Live Tracking: {data?.visit?.employee_name || 'Loading...'}</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>En route to: {data?.visit?.client_name || '...'}</p>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Distance</div>
               <div style={{ fontSize: '18px', color: '#2563EB', fontWeight: '800' }}>{data?.liveDistance || '0.00'} km</div>
             </div>
             <div style={{ width: '1px', height: '30px', background: '#E2E8F0' }}></div>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Fee</div>
               <div style={{ fontSize: '18px', color: '#10B981', fontWeight: '800' }}>₹{data?.liveFee || '0.00'}</div>
             </div>
             <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', marginLeft: '12px' }}><XCircle size={28} color="#94A3B8" /></button>
          </div>
        </div>
        <div ref={mapRef} style={{ flex: 1, width: '100%', background: '#E2E8F0' }}></div>
      </div>
    </div>
  );
};

export default function ClientVisits() {
  const [activeVisits, setActiveVisits] = useState([]);
  const [completedVisits, setCompletedVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [liveTrackId, setLiveTrackId] = useState(null);

  const [clientName, setClientName] = useState('');
  const [photoData, setPhotoData] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const trackingInterval = useRef(null);

  const fetchActiveVisits = async () => {
    try {
      const res = await apiFetch('/client-visits/active');
      if (res.success) {
        setActiveVisits(res.visits || []);
        setCompletedVisits(res.completedVisits || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVisits();
    return () => {
      stopCamera();
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    };
  }, []);

  // Background GPS Tracking for Active Visits
  useEffect(() => {
    if (activeVisits.length > 0) {
      // Start tracking interval (every 1 min)
      trackingInterval.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            for (let visit of activeVisits) {
              try {
                await apiFetch('/client-visits/track', {
                  method: 'POST',
                  body: JSON.stringify({ visitId: visit.id, lat, lng })
                });
              } catch (e) { console.error('Tracking Error', e); }
            }
          },
          (err) => console.error("GPS Tracking Error:", err),
          { enableHighAccuracy: true }
        );
      }, 60000); // 1 minute
    } else {
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    }
    return () => clearInterval(trackingInterval.current);
  }, [activeVisits]);

  const startCamera = async () => {
    setIsCapturing(true);
    setPhotoData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please allow permissions.");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataUrl);
      stopCamera();
    }
  };

  const dataURLtoBlob = (dataurl) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  };

  const handleStartVisit = async () => {
    if (!clientName || !photoData) return alert("Client name and photo are required.");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const formData = new FormData();
        formData.append('clientName', clientName);
        formData.append('lat', position.coords.latitude);
        formData.append('lng', position.coords.longitude);
        formData.append('photo', dataURLtoBlob(photoData), 'checkin.jpg');

        try {
          const data = await apiFetch('/client-visits/start', {
            method: 'POST',
            body: formData
          });
          if (data.success) {
            setShowStartModal(false);
            setClientName('');
            setPhotoData(null);
            fetchActiveVisits();
          } else {
            alert(data.message);
          }
        } catch (err) {
          console.error(err);
          alert("Error starting visit");
        }
      },
      (err) => alert("Could not get GPS location. " + err.message),
      { enableHighAccuracy: true }
    );
  };

  const handleEndVisit = async () => {
    if (!photoData || !selectedVisit) return alert("Photo is required to end visit.");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const formData = new FormData();
        formData.append('visitId', selectedVisit.id);
        formData.append('lat', position.coords.latitude);
        formData.append('lng', position.coords.longitude);
        formData.append('photo', dataURLtoBlob(photoData), 'checkout.jpg');

        try {
          const data = await apiFetch('/client-visits/end', {
            method: 'POST',
            body: formData
          });
          if (data.success) {
            alert(`Visit Ended! \nDistance: ${data.data.distance} km\nFee: ₹${data.data.fee}`);
            setShowEndModal(false);
            setPhotoData(null);
            setSelectedVisit(null);
            fetchActiveVisits();
          } else {
            alert(data.message);
          }
        } catch (err) {
          console.error(err);
          alert("Error ending visit");
        }
      },
      (err) => alert("Could not get GPS location. " + err.message),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Active Client Visits</h2>
        <button 
          className="hrms-primary-btn" 
          onClick={() => { setShowStartModal(true); startCamera(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10B981', color: '#FFF' }}
        >
          <Play size={16} /> Start New Visit
        </button>
      </div>

      {liveTrackId && <LiveTrackingMap visitId={liveTrackId} onClose={() => setLiveTrackId(null)} />}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading active visits...</p>
      ) : activeVisits.length === 0 ? (
        <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', padding: '40px', textAlign: 'center', borderRadius: '12px', color: '#64748B' }}>
          No active client visits right now. Click "Start New Visit" when you reach a client location.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {activeVisits.map(visit => (
            <div key={visit.id} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{visit.client_name}</h3>
                <span style={{ fontSize: '11px', background: '#ECFDF5', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Active Now</span>
              </div>
              
              {visit.employee_name && (
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB', marginBottom: '10px' }}>
                  Agent: {visit.employee_name}
                </div>
              )}
              
              {visit.photo_in_url && (
                <div style={{ marginBottom: '14px', borderRadius: '8px', overflow: 'hidden', height: '140px', background: '#F1F5F9' }}>
                  <img src={visit.photo_in_url} alt="Check-in" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <p style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Clock size={14} /> Checked in at: {new Date(visit.check_in_time).toLocaleTimeString()}
              </p>

              <button 
                  onClick={() => setLiveTrackId(visit.id)}
                  style={{ fontSize: '13px', color: '#FFF', background: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', width: '100%', justifyContent: 'center' }}
                >
                  <MapPin size={14} /> Live Track Agent
              </button>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  onClick={() => { setSelectedVisit(visit); setShowEndModal(true); startCamera(); }}
                  style={{ flex: 1, padding: '10px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  <Square size={16} /> End Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedVisits && completedVisits.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <CheckCircle2 size={18} color="#10B981"/> Today's Completed Visits
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {completedVisits.map(visit => (
              <div key={`comp-${visit.id}`} className="hrms-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{visit.client_name}</h3>
                  <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#64748B', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Completed</span>
                </div>
                
                {visit.employee_name && (
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>
                    Agent: {visit.employee_name}
                  </div>
                )}
                
                <p style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Clock size={14} /> In: {new Date(visit.check_in_time).toLocaleTimeString()}
                </p>
                <p style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Clock size={14} /> Out: {new Date(visit.check_out_time).toLocaleTimeString()}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '12px', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>TOTAL DISTANCE</div>
                    <div style={{ fontSize: '15px', color: '#2563EB', fontWeight: '800' }}>{visit.distance_travelled || '0.00'} km</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>ACCOM. FEE</div>
                    <div style={{ fontSize: '15px', color: '#10B981', fontWeight: '800' }}>₹{visit.calculated_fee || '0.00'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Visit Modal */}
      {showStartModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>Start Client Visit</h3>
            
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Client Name</span>
              <input 
                type="text" 
                value={clientName} 
                onChange={e => setClientName(e.target.value)} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} 
                placeholder="Enter client or company name"
              />
            </label>

            <div style={{ background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden', height: '240px', position: 'relative', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photoData ? (
                <img src={photoData} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {!photoData && (
                <button 
                  onClick={takePhoto} 
                  style={{ position: 'absolute', bottom: '16px', background: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                >
                  <Camera size={20} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowStartModal(false); stopCamera(); }}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >Cancel</button>
              <button 
                onClick={handleStartVisit}
                disabled={!clientName || !photoData}
                style={{ flex: 1, padding: '12px', background: (!clientName || !photoData) ? '#94A3B8' : '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', cursor: (!clientName || !photoData) ? 'not-allowed' : 'pointer', fontWeight: '600' }}
              >Start Visit</button>
            </div>
          </div>
        </div>
      )}

      {/* End Visit Modal */}
      {showEndModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>End Client Visit</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>Take a photo from the client's location to verify checkout.</p>
            
            <div style={{ background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden', height: '240px', position: 'relative', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photoData ? (
                <img src={photoData} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {!photoData && (
                <button 
                  onClick={takePhoto} 
                  style={{ position: 'absolute', bottom: '16px', background: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                >
                  <Camera size={20} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowEndModal(false); stopCamera(); setSelectedVisit(null); }}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >Cancel</button>
              <button 
                onClick={handleEndVisit}
                disabled={!photoData}
                style={{ flex: 1, padding: '12px', background: (!photoData) ? '#94A3B8' : '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', cursor: (!photoData) ? 'not-allowed' : 'pointer', fontWeight: '600' }}
              >Confirm End Visit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
