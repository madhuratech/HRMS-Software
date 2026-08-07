import React, { useEffect, useRef, useState } from 'react';

export default function GeofenceMap({ lat, lng, radius, onChange, readonly = false }) {
  const mapRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const circleInstance = useRef(null);

  // Load Leaflet dynamically via CDN
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Keep loaded resources to avoid refetching
    };
  }, []);

  // Initialize and update Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = window.L;
    const defaultLat = parseFloat(lat) || 12.9716;
    const defaultLng = parseFloat(lng) || 77.5946;
    const currentRadius = parseInt(radius) || 100;

    if (!mapInstance.current) {
      // Create map
      mapInstance.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 14);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Add Marker
      markerInstance.current = L.marker([defaultLat, defaultLng], {
        draggable: !readonly
      }).addTo(mapInstance.current);

      // Add Circle
      circleInstance.current = L.circle([defaultLat, defaultLng], {
        radius: currentRadius,
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.2
      }).addTo(mapInstance.current);

      // Map Click listener to change marker position
      if (!readonly) {
        mapInstance.current.on('click', (e) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          markerInstance.current.setLatLng([clickLat, clickLng]);
          circleInstance.current.setLatLng([clickLat, clickLng]);
          onChange(clickLat, clickLng);
        });

        // Marker dragend listener
        markerInstance.current.on('dragend', (e) => {
          const { lat: dragLat, lng: dragLng } = e.target.getLatLng();
          circleInstance.current.setLatLng([dragLat, dragLng]);
          onChange(dragLat, dragLng);
        });
      }
    } else {
      // Update Marker and Circle values
      const newLatLng = [defaultLat, defaultLng];
      markerInstance.current.setLatLng(newLatLng);
      circleInstance.current.setLatLng(newLatLng);
      circleInstance.current.setRadius(currentRadius);
      mapInstance.current.setView(newLatLng);
    }
  }, [leafletLoaded, lat, lng, radius, readonly]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
      {!leafletLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#6B7280', fontSize: 13, fontWeight: 500 }}>
          Loading Map Interface...
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
    </div>
  );
}
