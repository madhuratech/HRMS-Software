import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { apiFetch } from '../../lib/api';
import { MapPin, Navigation, Camera, CheckCircle2, XCircle, Play, Map as MapIcon, Building, LogOut, Search, Loader2, Link } from 'lucide-react';

// ─── Parse Google Maps URL to lat/lng ──────────────────────────────────────
function parseGoogleMapsUrl(url) {
  if (!url) return null;
  // Format: https://maps.google.com/?q=lat,lng
  let m = url.match(/[?&]q=([−\-]?\d+\.?\d*),([−\-]?\d+\.?\d*)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  // Format: https://www.google.com/maps/place/.../@lat,lng,zoom
  m = url.match(/@([−\-]?\d+\.?\d*),([−\-]?\d+\.?\d*)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  // Format: maps.google.com/maps?ll=lat,lng
  m = url.match(/[?&]ll=([−\-]?\d+\.?\d*),([−\-]?\d+\.?\d*)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

// ─── Geocode address via Nominatim ─────────────────────────────────────────
async function geocodeAddress(q) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`, {
      headers: { 'Accept-Language': 'en' }
    });
    return await res.json();
  } catch { return []; }
}

// ─── OSRM shortest-path route (road-following, like Swiggy) ──────────────
async function getOSRMRoute(fromLat, fromLng, toLat, toLng) {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]) {
      const coords = data.routes[0].geometry.coordinates;
      return {
        latlngs: coords.map(c => [c[1], c[0]]),
        distance: (data.routes[0].distance / 1000).toFixed(1),
        duration: Math.round(data.routes[0].duration / 60)
      };
    }
  } catch {}
  return null;
}

// ─── Smooth marker animation (lat/lng interpolation) ─────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function animateTo(from, to, ms, onUpdate) {
  const start = Date.now();
  function step() {
    const t = Math.min((Date.now() - start) / ms, 1);
    const e = easeInOut(t);
    onUpdate([lerp(from[0], to[0], e), lerp(from[1], to[1], e)]);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Inject CSS once (for UI styles only; no Leaflet) ────────────────────────
function injectStyles() {
  if (document.getElementById('gps-ui-style')) return;
  const s = document.createElement('style');
  s.id = 'gps-ui-style';
  s.textContent = `
    @keyframes livePulse {
      0%,100% { opacity:1; transform:scale(1); }
      50% { opacity:0.6; transform:scale(1.3); }
    }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .gps-input { width:100%; padding:10px 12px; border:1.5px solid #E2E8F0; border-radius:8px; font-size:14px; color:#1E293B; outline:none; box-sizing:border-box; transition:border-color .2s; background:#fff; }
    .gps-input:focus { border-color:#2563EB; }
    .gps-btn-primary { background:#2563EB; color:#fff; border:none; border-radius:8px; padding:11px 20px; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:background .15s; }
    .gps-btn-primary:hover { background:#1D4ED8; }
    .gps-btn-primary:disabled { background:#94A3B8; cursor:not-allowed; }
    .gps-btn-ghost { background:#F8FAFC; color:#475569; border:1.5px solid #E2E8F0; border-radius:8px; padding:11px 20px; font-size:14px; font-weight:600; cursor:pointer; }
    .gps-card { background:#fff; border:1px solid #E8EEFF; border-radius:14px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
  `;
  document.head.appendChild(s);
}

// MapLibre style with both street and satellite layers via layer control
const STREET_STYLE = {
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm' }]
};

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'esri-sat': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri'
    },
    'esri-ref': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256
    }
  },
  layers: [
    { id: 'esri-sat-tiles', type: 'raster', source: 'esri-sat' },
    { id: 'esri-ref-tiles', type: 'raster', source: 'esri-ref' }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// LIVE TRACKING MAP MODAL  (react-map-gl / MapLibre GL)
// ═══════════════════════════════════════════════════════════════════════════
const LiveTrackingMap = ({ visitId, onClose }) => {
  const [data, setData] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [bikePos, setBikePos] = useState(null);   // animated [lat, lng]
  const lastPt = useRef(null);
  const [mapStyle, setMapStyle] = useState('street');
  const [viewState, setViewState] = useState({ longitude: 77.0, latitude: 11.0, zoom: 13 });

  // OSRM planned route GeoJSON
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  // Actual travelled path GeoJSON
  const [travelGeoJSON, setTravelGeoJSON] = useState(null);

  const buildMap = useCallback(async (visit, points) => {
    const destLat = visit.client_dest_lat ? parseFloat(visit.client_dest_lat)
      : (visit.check_in_lat ? parseFloat(visit.check_in_lat) : null);
    const destLng = visit.client_dest_lng ? parseFloat(visit.client_dest_lng)
      : (visit.check_in_lng ? parseFloat(visit.check_in_lng) : null);

    // Current live position
    const currentLat = points?.length ? parseFloat(points[points.length - 1].latitude)
      : (visit.office_lat ? parseFloat(visit.office_lat) : null);
    const currentLng = points?.length ? parseFloat(points[points.length - 1].longitude)
      : (visit.office_lng ? parseFloat(visit.office_lng) : null);

    // Fetch planned road route
    if (currentLat && currentLng && destLat && destLng) {
      const route = await getOSRMRoute(currentLat, currentLng, destLat, destLng);
      if (route) {
        setRouteInfo(route);
        setRouteGeoJSON({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: route.latlngs.map(([la, ln]) => [ln, la]) }
          }]
        });
      }
    }

    // Actual path
    if (points?.length > 1) {
      const coords = points.map(p => [parseFloat(p.longitude), parseFloat(p.latitude)]);
      setTravelGeoJSON({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }]
      });

      // Animate bike marker
      const last = [parseFloat(points[points.length - 1].latitude), parseFloat(points[points.length - 1].longitude)];
      if (lastPt.current) {
        animateTo(lastPt.current, last, 2500, pos => setBikePos(pos));
      } else {
        setBikePos(last);
      }
      lastPt.current = last;

      // Fit bounds
      const allLngs = coords.map(c => c[0]);
      const allLats = coords.map(c => c[1]);
      if (visit.office_lat) { allLngs.push(parseFloat(visit.office_lng)); allLats.push(parseFloat(visit.office_lat)); }
      if (destLng) { allLngs.push(destLng); allLats.push(destLat); }
      setViewState(prev => ({ ...prev,
        longitude: (Math.min(...allLngs) + Math.max(...allLngs)) / 2,
        latitude: (Math.min(...allLats) + Math.max(...allLats)) / 2,
        zoom: 13
      }));
    } else {
      const startPt = points?.length === 1
        ? [parseFloat(points[0].latitude), parseFloat(points[0].longitude)]
        : visit.office_lat ? [parseFloat(visit.office_lat), parseFloat(visit.office_lng)] : null;

      if (startPt) {
        setBikePos(startPt);
        setViewState(prev => ({ ...prev, longitude: startPt[1], latitude: startPt[0], zoom: 14 }));
      }
    }
  }, []);

  const fetch_ = useCallback(async () => {
    const res = await apiFetch(`/client-visits/${visitId}/track`);
    if (res.success) { setData(res); buildMap(res.visit, res.points); }
  }, [visitId, buildMap]);

  useEffect(() => { injectStyles(); fetch_(); const i = setInterval(fetch_, 15000); return () => clearInterval(i); }, [fetch_]);

  const v = data?.visit;
  const stageColor = { Travelling: '#2563EB', 'In Meeting': '#10B981', Returning: '#F59E0B' }[v?.status] || '#64748B';

  const destLat = v?.client_dest_lat ? parseFloat(v.client_dest_lat) : (v?.check_in_lat ? parseFloat(v.check_in_lat) : null);
  const destLng = v?.client_dest_lng ? parseFloat(v.client_dest_lng) : (v?.check_in_lng ? parseFloat(v.check_in_lng) : null);

  const activeStyle = mapStyle === 'satellite' ? SATELLITE_STYLE : STREET_STYLE;

  const steps = [
    { label: 'Journey Started', time: v?.start_journey_time, done: true, color: '#2563EB' },
    { label: 'Reached Client', sub: 'Meeting Start', time: v?.check_in_time, done: !!v?.check_in_time, color: '#10B981', photo: v?.photo_in_url },
    { label: 'Meeting Ended', sub: 'Returning', time: v?.check_out_time, done: !!v?.check_out_time, color: '#F59E0B', photo: v?.photo_out_url },
    { label: 'Journey Completed', time: v?.end_journey_time, done: !!v?.end_journey_time, color: '#EF4444' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', backdropFilter:'blur(3px)' }}>
      <div style={{ background:'#fff', width:'100%', maxWidth:'1060px', borderRadius:'16px', overflow:'hidden', display:'flex', flexDirection:'column', height:'88vh', boxShadow:'0 20px 60px rgba(0,0,0,0.18)', border:'1px solid #E2E8F0' }}>

        {/* Header */}
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff' }}>
          <div>
            <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A' }}>Live Tracking — {v?.employee_name || '...'}</div>
            <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>Client: <b>{v?.client_name}</b></div>
          </div>
          <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'10px', color:'#94A3B8', fontWeight:'700', textTransform:'uppercase' }}>Stage</div>
              <div style={{ fontSize:'13px', fontWeight:'700', color:stageColor, marginTop:'2px' }}>{v?.status || '...'}</div>
            </div>
            <div style={{ width:'1px', height:'28px', background:'#F1F5F9' }} />
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'10px', color:'#94A3B8', fontWeight:'700', textTransform:'uppercase' }}>Live KM</div>
              <div style={{ fontSize:'18px', fontWeight:'900', color:'#2563EB', marginTop:'2px' }}>{data?.liveDistance || '0.00'}</div>
            </div>
            {routeInfo && <>
              <div style={{ width:'1px', height:'28px', background:'#F1F5F9' }} />
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'10px', color:'#94A3B8', fontWeight:'700', textTransform:'uppercase' }}>Route</div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#64748B', marginTop:'2px' }}>{routeInfo.distance}km</div>
              </div>
            </>}
            {/* Map Style Toggle */}
            <div style={{ display:'flex', gap:'4px', background:'#F8FAFC', borderRadius:'8px', padding:'3px', border:'1px solid #E2E8F0' }}>
              {[['street','Street'],['satellite','Satellite']].map(([k, label]) => (
                <button key={k} onClick={() => setMapStyle(k)}
                  style={{ padding:'4px 10px', borderRadius:'6px', border:'none', fontSize:'11px', fontWeight:'600', cursor:'pointer',
                    background: mapStyle === k ? '#2563EB' : 'transparent',
                    color: mapStyle === k ? '#fff' : '#64748B' }}>{label}</button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'20px', padding:'4px 10px' }}>
              <div style={{ width:'7px', height:'7px', background:'#22C55E', borderRadius:'50%', animation:'livePulse 1.5s infinite' }} />
              <span style={{ fontSize:'11px', color:'#16A34A', fontWeight:'700' }}>LIVE</span>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', padding:'4px' }}>
              <XCircle size={22} color="#94A3B8" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          {/* Sidebar */}
          <div style={{ width:'260px', borderRight:'1px solid #F1F5F9', overflowY:'auto', padding:'16px' }}>
            <div style={{ fontSize:'11px', color:'#94A3B8', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'16px' }}>Timeline</div>
            {steps.map((s, i) => (
              <div key={i} style={{ display:'flex', gap:'10px', paddingBottom:i<3?'20px':'0', position:'relative' }}>
                {i < 3 && <div style={{ position:'absolute', left:'13px', top:'26px', bottom:0, width:'1.5px', background: s.done ? s.color + '44' : '#F1F5F9' }} />}
                <div style={{ width:'26px', height:'26px', borderRadius:'50%', flexShrink:0, background: s.done ? s.color : '#F8FAFC', border: s.done ? 'none' : '1.5px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px' }}>
                  {s.done ? '✓' : i+1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:'700', fontSize:'13px', color: s.done ? '#0F172A' : '#94A3B8' }}>{s.label}</div>
                  {s.sub && <div style={{ fontSize:'11px', color:'#94A3B8' }}>{s.sub}</div>}
                  <div style={{ fontSize:'12px', color: s.done ? '#64748B' : '#CBD5E1', marginTop:'2px' }}>
                    {s.time ? new Date(s.time).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true }) : 'Pending'}
                  </div>
                  {s.photo && <div style={{ marginTop:'8px', borderRadius:'8px', overflow:'hidden', height:'70px' }}><img src={s.photo} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" /></div>}
                </div>
              </div>
            ))}
            {/* Legend */}
            <div style={{ marginTop:'24px', background:'#F8FAFC', borderRadius:'10px', padding:'12px', fontSize:'12px', color:'#64748B' }}>
              <div style={{ fontWeight:'700', color:'#475569', marginBottom:'8px', fontSize:'11px', textTransform:'uppercase' }}>Map Legend</div>
              {[
                [<span key="a" style={{ display:'inline-block', width:'18px', height:'4px', background:'#2563EB', verticalAlign:'middle', borderRadius:'2px' }} />, 'Actual path taken'],
                [<span key="b" style={{ display:'inline-block', width:'18px', height:'4px', background:'#F97316', verticalAlign:'middle', borderRadius:'2px' }} />, 'Planned route (road)'],
                ['🏠', 'Office (start)'],
                ['🏢', 'Client (destination)'],
                ['🏍️', 'Live position'],
              ].map(([icon, label], i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }}>{icon} {label}</div>
              ))}
            </div>
          </div>

          {/* MapLibre Map */}
          <div style={{ flex:1, position:'relative' }}>
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapStyle={activeStyle}
              style={{ width:'100%', height:'100%' }}
            >
              {/* Planned OSRM route — shadow + orange main line */}
              {routeGeoJSON && (
                <Source type="geojson" data={routeGeoJSON} id="route-source">
                  <Layer id="route-shadow-line" type="line" paint={{ 'line-color': '#E2E8F0', 'line-width': 10, 'line-cap': 'round', 'line-join': 'round' }} />
                  <Layer id="route-main-line" type="line" paint={{ 'line-color': '#F97316', 'line-width': 6, 'line-cap': 'round', 'line-join': 'round' }} />
                  <Layer id="route-dash-line" type="line" paint={{ 'line-color': '#fff', 'line-width': 2, 'line-opacity': 0.5, 'line-dasharray': [2, 3] }} />
                </Source>
              )}

              {/* Actual travelled path — blue solid */}
              {travelGeoJSON && (
                <Source type="geojson" data={travelGeoJSON}>
                  <Layer id="travel-line" type="line" paint={{ 'line-color': '#2563EB', 'line-width': 4, 'line-opacity': 0.9, 'line-cap': 'round' }} />
                </Source>
              )}

              {/* Office start marker */}
              {v?.office_lat && (
                <Marker longitude={parseFloat(v.office_lng)} latitude={parseFloat(v.office_lat)} anchor="center">
                  <div style={{ width:'32px', height:'32px', background:'#fff', border:'2px solid #10B981', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>🏠</div>
                </Marker>
              )}

              {/* Destination marker */}
              {destLat && destLng && (
                <Marker longitude={destLng} latitude={destLat} anchor="center">
                  <div style={{ width:'32px', height:'32px', background:'#fff', border:'2px solid #EF4444', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>🏢</div>
                </Marker>
              )}

              {/* Animated bike marker */}
              {bikePos && (
                <Marker longitude={bikePos[1]} latitude={bikePos[0]} anchor="center">
                  <div style={{ width:'38px', height:'38px', background:'#fff', border:'2.5px solid #2563EB', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', boxShadow:'0 3px 12px rgba(37,99,235,0.35)' }}>🏍️</div>
                </Marker>
              )}
            </Map>

            {!data && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(248,250,252,0.9)', fontSize:'24px', color:'#94A3B8', flexDirection:'column', gap:'10px' }}>
                <div style={{ animation:'spin 2s linear infinite', fontSize:'28px' }}>🏍️</div>
                <div style={{ fontSize:'14px' }}>Loading tracking data...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// START JOURNEY MODAL — with Google Maps URL + address search
// ═══════════════════════════════════════════════════════════════════════════
const StartJourneyModal = ({ onStart, onClose }) => {
  const [clientName, setClientName] = useState('');
  const [inputMode, setInputMode] = useState('search'); // 'search' | 'gmaps'
  const [searchVal, setSearchVal] = useState('');
  const [gmapsUrl, setGmapsUrl] = useState('');
  const [results, setResults] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState(false);
  const timer = useRef(null);

  const doSearch = (val) => {
    setSearchVal(val); setSelectedDest(null);
    clearTimeout(timer.current);
    if (val.length < 3) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      const r = await geocodeAddress(val);
      setResults(r.slice(0, 5));
      setSearching(false);
    }, 500);
  };

  const handleGmapsUrl = (url) => {
    setGmapsUrl(url); setSelectedDest(null);
    const coords = parseGoogleMapsUrl(url);
    if (coords) setSelectedDest({ lat: coords.lat, lng: coords.lng, address: `Google Maps location (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})` });
  };

  const handleStart = () => {
    if (!clientName.trim()) return alert('Please enter client name');
    setStarting(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const res = await apiFetch('/client-visits/start-journey', {
          method: 'POST',
          body: JSON.stringify({
            clientName: clientName.trim(),
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            clientAddress: selectedDest?.address || null,
            destLat: selectedDest?.lat || null,
            destLng: selectedDest?.lng || null
          })
        });
        if (res.success) onStart();
        else { alert(res.message || 'Failed'); setStarting(false); }
      } catch (e) { alert(e.message); setStarting(false); }
    }, err => { alert('GPS error: ' + err.message); setStarting(false); }, { enableHighAccuracy: true });
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(3px)' }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', border:'1px solid #E2E8F0' }}>
        <div style={{ fontWeight:'800', fontSize:'18px', color:'#0F172A', marginBottom:'4px' }}>Start Journey</div>
        <div style={{ fontSize:'13px', color:'#64748B', marginBottom:'24px' }}>GPS tracking begins immediately when you start</div>

        {/* Client Name */}
        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px' }}>Client / Company Name *</label>
          <input className="gps-input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Reliance Industries Ltd" />
        </div>

        {/* Location mode tabs */}
        <div style={{ marginBottom:'12px' }}>
          <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'8px' }}>Client Location (optional, for route planning)</label>
          <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
            {[['search','Search address'],['gmaps','Google Maps link']].map(([mode, label]) => (
              <button key={mode} onClick={() => { setInputMode(mode); setSelectedDest(null); setResults([]); }}
                style={{ flex:1, padding:'8px', borderRadius:'8px', border: inputMode === mode ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0',
                  background: inputMode === mode ? '#EFF6FF' : '#F8FAFC', color: inputMode === mode ? '#2563EB' : '#64748B',
                  fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          {inputMode === 'search' && (
            <div style={{ position:'relative' }}>
              <Search size={14} color="#94A3B8" style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)' }} />
              <input className="gps-input" value={searchVal} onChange={e => doSearch(e.target.value)}
                placeholder="Search address or place name..." style={{ paddingLeft:'30px' }} />
              {searching && <Loader2 size={14} color="#2563EB" style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', animation:'spin 1s linear infinite' }} />}
              {results.length > 0 && (
                <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:100, background:'#fff', borderRadius:'8px', marginTop:'4px', border:'1px solid #E2E8F0', boxShadow:'0 8px 24px rgba(0,0,0,0.1)', overflow:'hidden' }}>
                  {results.map((r, i) => (
                    <div key={i} onClick={() => { setSelectedDest({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), address: r.display_name }); setSearchVal(r.display_name.substring(0,60)); setResults([]); }}
                      style={{ padding:'10px 12px', cursor:'pointer', fontSize:'12px', color:'#374151', borderBottom: i < results.length-1 ? '1px solid #F8FAFC' : 'none', display:'flex', gap:'8px', alignItems:'flex-start' }}
                      onMouseEnter={e => e.currentTarget.style.background='#F0F9FF'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <MapPin size={12} color="#2563EB" style={{ flexShrink:0, marginTop:'1px' }} />
                      <span style={{ lineHeight:'1.4' }}>{r.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {inputMode === 'gmaps' && (
            <div>
              <div style={{ position:'relative' }}>
                <Link size={14} color="#94A3B8" style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)' }} />
                <input className="gps-input" value={gmapsUrl} onChange={e => handleGmapsUrl(e.target.value)}
                  placeholder="Paste Google Maps link here..." style={{ paddingLeft:'30px' }} />
              </div>
              <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'5px' }}>
                Right-click any location in Google Maps → "Share" → copy the link and paste here
              </div>
            </div>
          )}
        </div>

        {selectedDest && (
          <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'8px', padding:'10px 12px', marginBottom:'16px', fontSize:'12px', color:'#16A34A', display:'flex', gap:'6px', alignItems:'flex-start' }}>
            <CheckCircle2 size={14} style={{ flexShrink:0, marginTop:'1px' }} />
            <span>Location confirmed — route will be shown on map</span>
          </div>
        )}

        <div style={{ display:'flex', gap:'10px' }}>
          <button className="gps-btn-ghost" onClick={onClose} style={{ flex:1 }}>Cancel</button>
          <button className="gps-btn-primary" onClick={handleStart} disabled={!clientName.trim() || starting} style={{ flex:1, justifyContent:'center' }}>
            {starting ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Starting...</> : <><Navigation size={14} /> Start Tracking</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PHOTO VERIFICATION MODAL
// ═══════════════════════════════════════════════════════════════════════════
const PhotoModal = ({ action, visit, onSubmit, onClose }) => {
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); }
      } catch (e) { alert('Camera: ' + e.message); }
    })();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const snap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    setPhoto(canvasRef.current.toDataURL('image/jpeg', 0.85));
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const toBlob = (d) => {
    const arr = d.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const b = atob(arr[1]); const u = new Uint8Array(b.length);
    for (let n = 0; n < b.length; n++) u[n] = b.charCodeAt(n);
    return new Blob([u], { type: mime });
  };

  const submit = () => {
    if (!photo) return;
    setSubmitting(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const fd = new FormData();
        fd.append('visitId', visit.id);
        fd.append('lat', pos.coords.latitude);
        fd.append('lng', pos.coords.longitude);
        fd.append('photo', toBlob(photo), action === 'reachClient' ? 'arrival.jpg' : 'end.jpg');
        const ep = action === 'reachClient' ? '/client-visits/reach-client' : '/client-visits/end-meeting';
        const res = await apiFetch(ep, { method:'POST', body:fd });
        if (res.success) onSubmit(); else { alert(res.message); setSubmitting(false); }
      } catch (e) { alert(e.message); setSubmitting(false); }
    }, e => { alert(e.message); setSubmitting(false); }, { enableHighAccuracy:true });
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(3px)' }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'24px', width:'100%', maxWidth:'360px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A', marginBottom:'4px' }}>
          {action === 'reachClient' ? '📍 Verify Arrival' : '✅ Verify Meeting End'}
        </div>
        <div style={{ fontSize:'12px', color:'#64748B', marginBottom:'16px' }}>
          Take a photo at the {action === 'reachClient' ? 'client location' : 'meeting end'} to verify
        </div>

        <div style={{ borderRadius:'12px', overflow:'hidden', height:'210px', background:'#F8FAFC', position:'relative', marginBottom:'16px', border:'1px solid #E2E8F0' }}>
          {photo
            ? <img src={photo} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
            : <video ref={videoRef} style={{ width:'100%', height:'100%', objectFit:'cover' }} playsInline muted />}
          <canvas ref={canvasRef} style={{ display:'none' }} />
          {!photo && (
            <button onClick={snap} style={{ position:'absolute', bottom:'12px', left:'50%', transform:'translateX(-50%)', background:'#2563EB', color:'#fff', border:'none', borderRadius:'50%', width:'46px', height:'46px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 14px rgba(37,99,235,0.4)' }}>
              <Camera size={20} />
            </button>
          )}
          {photo && (
            <button onClick={() => { setPhoto(null); (async()=>{ const s = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); streamRef.current=s; if(videoRef.current){videoRef.current.srcObject=s; videoRef.current.play();} })(); }}
              style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'6px', color:'#fff', padding:'4px 8px', fontSize:'11px', cursor:'pointer', fontWeight:'600' }}>
              Retake
            </button>
          )}
        </div>

        <div style={{ display:'flex', gap:'10px' }}>
          <button className="gps-btn-ghost" onClick={onClose} style={{ flex:1 }}>Cancel</button>
          <button className="gps-btn-primary" onClick={submit} disabled={!photo || submitting} style={{ flex:1, justifyContent:'center', background: !photo||submitting ? '#94A3B8' : '#10B981' }}>
            {submitting ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} />Uploading...</> : '✓ Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function ClientVisits() {
  const [active, setActive] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStart, setShowStart] = useState(false);
  const [photoModal, setPhotoModal] = useState(null); // { action, visit }
  const [liveId, setLiveId] = useState(null);
  const trackTimer = useRef(null);

  useEffect(() => { injectStyles(); }, []);

  const fetchVisits = useCallback(async () => {
    const res = await apiFetch('/client-visits/active').catch(() => null);
    if (res?.success) { setActive(res.visits || []); setCompleted(res.completedVisits || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVisits(); return () => clearInterval(trackTimer.current); }, [fetchVisits]);

  // Background GPS ping — every 45 seconds
  useEffect(() => {
    clearInterval(trackTimer.current);
    if (active.length > 0) {
      trackTimer.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(async pos => {
          for (const v of active) {
            if (['Travelling','In Meeting','Returning'].includes(v.status)) {
              await apiFetch('/client-visits/track', { method:'POST', body:JSON.stringify({ visitId:v.id, lat:pos.coords.latitude, lng:pos.coords.longitude }) }).catch(()=>{});
            }
          }
        }, () => {}, { enableHighAccuracy:true });
      }, 45000);
    }
    return () => clearInterval(trackTimer.current);
  }, [active]);

  const closeJourney = (visit) => {
    if (!confirm('Confirm you have returned to office?')) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      const res = await apiFetch('/client-visits/reach-office', { method:'POST', body:JSON.stringify({ visitId:visit.id, lat:pos.coords.latitude, lng:pos.coords.longitude }) });
      if (res.success) { alert(`Journey closed!\nDistance: ${res.data.distance} km`); fetchVisits(); }
      else alert(res.message);
    }, e => alert(e.message), { enableHighAccuracy:true });
  };

  const stageBtn = {
    Travelling: { label:'Reached Client — Take Photo', bg:'#10B981', action:'reachClient' },
    'In Meeting': { label:'Meeting Done — Take Photo', bg:'#F59E0B', action:'endMeeting' },
    Returning: { label:'Back at Office — Close Journey', bg:'#EF4444', action:'close' },
  };

  const stageBadge = {
    Travelling: { bg:'#EFF6FF', text:'#2563EB' },
    'In Meeting': { bg:'#F0FDF4', text:'#16A34A' },
    Returning: { bg:'#FFFBEB', text:'#D97706' },
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", maxWidth:'1100px' }}>
      {/* Modals */}
      {showStart && <StartJourneyModal onStart={() => { setShowStart(false); fetchVisits(); }} onClose={() => setShowStart(false)} />}
      {photoModal && <PhotoModal action={photoModal.action} visit={photoModal.visit} onSubmit={() => { setPhotoModal(null); fetchVisits(); }} onClose={() => setPhotoModal(null)} />}
      {liveId && <LiveTrackingMap visitId={liveId} onClose={() => setLiveId(null)} />}

      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h2 style={{ margin:0, fontSize:'20px', fontWeight:'800', color:'#0F172A' }}>GPS Field Tracking</h2>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#64748B' }}>Sales & Marketing live journey management</p>
        </div>
        <button className="gps-btn-primary" onClick={() => setShowStart(true)}>
          <Navigation size={15} /> Start Journey
        </button>
      </div>

      {/* Active journeys */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#94A3B8', fontSize:'14px' }}>Loading journeys...</div>
      ) : active.length === 0 ? (
        <div style={{ background:'#F8FAFC', border:'1.5px dashed #CBD5E1', borderRadius:'14px', padding:'60px', textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>🏍️</div>
          <div style={{ fontWeight:'700', color:'#0F172A', fontSize:'15px', marginBottom:'6px' }}>No active journeys</div>
          <div style={{ color:'#64748B', fontSize:'13px' }}>Click "Start Journey" before leaving the office</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'16px' }}>
          {active.map(v => {
            const badge = stageBadge[v.status] || { bg:'#F8FAFC', text:'#64748B' };
            const btn = stageBtn[v.status];
            return (
              <div key={v.id} className="gps-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div>
                    <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A' }}>{v.client_name}</div>
                    {v.employee_name && <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>👤 {v.employee_name}</div>}
                  </div>
                  <span style={{ fontSize:'11px', fontWeight:'700', background:badge.bg, color:badge.text, padding:'4px 10px', borderRadius:'20px', whiteSpace:'nowrap' }}>
                    {v.status}
                  </span>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'5px', marginBottom:'14px' }}>
                  <div style={{ fontSize:'12px', color:'#64748B', display:'flex', gap:'6px', alignItems:'center' }}>
                    <Play size={11} color="#2563EB" /> Left: {new Date(v.start_journey_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}
                  </div>
                  {v.check_in_time && <div style={{ fontSize:'12px', color:'#64748B', display:'flex', gap:'6px', alignItems:'center' }}><Building size={11} color="#10B981" /> Reached: {new Date(v.check_in_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}</div>}
                  {v.check_out_time && <div style={{ fontSize:'12px', color:'#64748B', display:'flex', gap:'6px', alignItems:'center' }}><LogOut size={11} color="#F59E0B" /> Meeting ended: {new Date(v.check_out_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}</div>}
                </div>

                <button onClick={() => setLiveId(v.id)} style={{ width:'100%', padding:'9px', background:'#F0F6FF', color:'#2563EB', border:'1px solid #DBEAFE', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginBottom:'10px' }}>
                  <MapIcon size={14} /> Open Live Map
                </button>

                {btn && (
                  <button
                    onClick={() => btn.action === 'close' ? closeJourney(v) : setPhotoModal({ action:btn.action, visit:v })}
                    style={{ width:'100%', padding:'10px', background:btn.bg, color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                    {btn.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed today */}
      {completed.length > 0 && (
        <div style={{ marginTop:'36px' }}>
          <div style={{ fontWeight:'800', fontSize:'15px', color:'#0F172A', marginBottom:'14px', display:'flex', alignItems:'center', gap:'6px' }}>
            <CheckCircle2 size={16} color="#10B981" /> Today's Completed Journeys
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'14px' }}>
            {completed.map(v => (
              <div key={v.id} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'12px', padding:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div style={{ fontWeight:'700', color:'#0F172A', fontSize:'14px' }}>{v.client_name}</div>
                  <span style={{ fontSize:'10px', background:'#F1F5F9', color:'#64748B', padding:'3px 7px', borderRadius:'4px', fontWeight:'600' }}>DONE</span>
                </div>
                {v.employee_name && <div style={{ fontSize:'12px', color:'#64748B', marginBottom:'10px' }}>👤 {v.employee_name}</div>}
                <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid #E2E8F0', paddingTop:'10px' }}>
                  <div><div style={{ fontSize:'10px', color:'#94A3B8', fontWeight:'700' }}>DISTANCE</div><div style={{ fontSize:'15px', color:'#2563EB', fontWeight:'800' }}>{v.distance_travelled || '0.00'} km</div></div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:'10px', color:'#94A3B8', fontWeight:'700' }}>DURATION</div>
                    <div style={{ fontSize:'13px', color:'#64748B', fontWeight:'600' }}>
                      {v.start_journey_time && v.end_journey_time ? `${Math.round((new Date(v.end_journey_time)-new Date(v.start_journey_time))/60000)} min` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
