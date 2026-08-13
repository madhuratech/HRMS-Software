import React, { useEffect, useRef, useState } from 'react';

export default function GeofenceMap({ lat, lng, radius, onChange, readonly = false }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const circleInstance = useRef(null);

  // Load Leaflet dynamically
  useEffect(() => {
    let isMounted = true;

    if (window.L) {
      setMapLoaded(true);
      return;
    }

    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css';
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }

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

  // Initialize and update Map using Leaflet Engine
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.L) return;

    const L = window.L;
    const defaultLat = parseFloat(lat) || 11.0130;
    const defaultLng = parseFloat(lng) || 76.9567;
    const currentRadius = parseInt(radius) || 100;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }).addTo(mapInstance.current);

      circleInstance.current = L.circle([defaultLat, defaultLng], {
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        radius: currentRadius
      }).addTo(mapInstance.current);

      markerInstance.current = L.circleMarker([defaultLat, defaultLng], {
        radius: 8,
        fillColor: '#2563EB',
        color: '#FFFFFF',
        weight: 3,
        fillOpacity: 1
      }).addTo(mapInstance.current);

      if (!readonly) {
        mapInstance.current.on('click', (e) => {
          const clickedLat = e.latlng.lat;
          const clickedLng = e.latlng.lng;
          markerInstance.current.setLatLng([clickedLat, clickedLng]);
          circleInstance.current.setLatLng([clickedLat, clickedLng]);
          if (onChange) onChange(clickedLat, clickedLng);
        });
      }
    } else {
      markerInstance.current.setLatLng([defaultLat, defaultLng]);
      circleInstance.current.setLatLng([defaultLat, defaultLng]);
      circleInstance.current.setRadius(currentRadius);
      mapInstance.current.panTo([defaultLat, defaultLng]);
    }
  }, [mapLoaded, lat, lng, radius, readonly, onChange]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
      {!mapLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#6B7280', fontSize: 13, fontWeight: 500 }}>
          Loading Geofence Map Interface...
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
