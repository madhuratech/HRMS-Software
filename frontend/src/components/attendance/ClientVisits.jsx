import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../lib/api';
import { MapPin, Navigation, Camera, CheckCircle2, Clock, XCircle, Play, Square } from 'lucide-react';

export default function ClientVisits() {
  const [activeVisits, setActiveVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

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
                await fetch('http://localhost:5001/api/client-visits/track', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
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
          const res = await fetch('http://localhost:5001/api/client-visits/start', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
          });
          const data = await res.json();
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
          const res = await fetch('http://localhost:5001/api/client-visits/end', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            alert(`Visit Ended! \nDistance: ${data.data.distance} km\nFee: $${data.data.fee}`);
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
              <p style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <Clock size={14} /> Checked in at: {new Date(visit.check_in_time).toLocaleTimeString()}
              </p>
              
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
