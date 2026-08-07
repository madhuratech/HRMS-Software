import React, { useEffect, useRef, useState } from 'react';

export default function GeofenceMap({ lat, lng, radius, onChange, readonly = false }) {
  const mapRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const circleInstance = useRef(null);

  // Load Google Maps API dynamically via CDN
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    // Check if the script is already added
    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setGoogleMapsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=weekly';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleMapsLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize and update Map
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current) return;

    const maps = window.google.maps;
    const defaultLat = parseFloat(lat) || 12.9716;
    const defaultLng = parseFloat(lng) || 77.5946;
    const currentRadius = parseInt(radius) || 100;
    const centerLatLng = { lat: defaultLat, lng: defaultLng };

    if (!mapInstance.current) {
      // Create Google Map
      mapInstance.current = new maps.Map(mapRef.current, {
        center: centerLatLng,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: readonly ? 'none' : 'auto'
      });

      // Add Circle
      circleInstance.current = new maps.Circle({
        strokeColor: '#2563EB',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        map: mapInstance.current,
        center: centerLatLng,
        radius: currentRadius
      });

      // Add Draggable Marker
      markerInstance.current = new maps.Marker({
        position: centerLatLng,
        map: mapInstance.current,
        draggable: !readonly,
        title: 'Geofence Center'
      });

      if (!readonly) {
        // Map Click listener
        mapInstance.current.addListener('click', (e) => {
          const clickedLat = e.latLng.lat();
          const clickedLng = e.latLng.lng();
          const newPos = { lat: clickedLat, lng: clickedLng };
          markerInstance.current.setPosition(newPos);
          circleInstance.current.setCenter(newPos);
          onChange(clickedLat, clickedLng);
        });

        // Marker dragend listener
        markerInstance.current.addListener('dragend', () => {
          const position = markerInstance.current.getPosition();
          const dragLat = position.lat();
          const dragLng = position.lng();
          const newPos = { lat: dragLat, lng: dragLng };
          circleInstance.current.setCenter(newPos);
          onChange(dragLat, dragLng);
        });
      }
    } else {
      // Update Marker and Circle values
      markerInstance.current.setPosition(centerLatLng);
      circleInstance.current.setCenter(centerLatLng);
      circleInstance.current.setRadius(currentRadius);
      mapInstance.current.panTo(centerLatLng);
    }
  }, [googleMapsLoaded, lat, lng, radius, readonly]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
      {!googleMapsLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#6B7280', fontSize: 13, fontWeight: 500 }}>
          Loading Google Maps Interface...
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
