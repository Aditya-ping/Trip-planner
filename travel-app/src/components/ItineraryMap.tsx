"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Place {
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
}

interface DayItinerary {
  day: number;
  places: Place[];
}

interface ItineraryMapProps {
  itinerary: DayItinerary[];
}

export default function ItineraryMap({ itinerary }: ItineraryMapProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // 1. Dynamically load Leaflet CDN scripts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Leaflet is already loaded
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Add JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Keep CDN links for persistence across tabs but we can clean them up if needed
    };
  }, []);

  // 2. Initialize and Update Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const currentDayData = itinerary.find(d => d.day === selectedDay);
    if (!currentDayData || currentDayData.places.length === 0) return;

    const places = currentDayData.places;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      });

      // Add elegant CartoDB Dark Matter tile layer to match dark glassmorphism theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Add Zoom control at bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Clear previous route polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Add Markers and gather coordinates
    const latlngs: any[] = [];
    places.forEach((place, idx) => {
      const lat = place.latitude;
      const lng = place.longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        const latlng = [lat, lng];
        latlngs.push(latlng);

        // Custom stylized Marker DivIcon
        const numberIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div class="w-7 h-7 rounded-full bg-accent-primary border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-lg transform transition-transform hover:scale-110">${idx + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupContent = `
          <div style="font-family: inherit; padding: 4px; color: #1e293b;">
            <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #02aeef;">${idx + 1}. ${place.name}</h4>
            <span style="font-size: 9px; text-transform: uppercase; font-weight: bold; color: #f25f5c; background: rgba(242,95,92,0.1); padding: 2px 6px; border-radius: 99px; display: inline-block; margin-top: 4px;">${place.category}</span>
            <p style="margin: 6px 0 0 0; font-size: 10px; color: #64748b; line-height: 1.4;">${place.description}</p>
          </div>
        `;

        const marker = L.marker(latlng, { icon: numberIcon })
          .bindPopup(popupContent, { closeButton: false, minWidth: 150 })
          .addTo(map);

        markersRef.current.push(marker);
      }
    });

    // Draw route connecting places
    if (latlngs.length > 1) {
      polylineRef.current = L.polyline(latlngs, {
        color: '#02aeef',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 10',
        lineCap: 'round'
      }).addTo(map);
    }

    // Fit Map bounds to show all markers
    if (latlngs.length > 0) {
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Invalidate size helper for container rendering updates
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [leafletLoaded, itinerary, selectedDay]);

  return (
    <div className="w-full flex flex-col gap-3 h-[450px] shrink-0">
      {/* Day Selector Tabs above Map */}
      <div className="flex gap-1.5 overflow-x-auto py-1 shrink-0 scrollbar-none">
        {itinerary.map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border transition-all shrink-0 ${
              selectedDay === d.day
                ? 'bg-accent-primary text-white border-accent-primary shadow-md'
                : 'bg-card-bg/40 text-text-muted border-border-color/60 hover:text-fg-main hover:bg-fg-main/5'
            }`}
          >
            Day {d.day} Map
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="w-full flex-grow rounded-2xl overflow-hidden border border-border-color relative shadow-inner bg-card-bg/20">
        {!leafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-muted bg-card-bg/80 z-20">
            <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Loading Live Route Map...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      </div>

      {/* Leaflet Custom DivIcon styles */}
      <style jsx global>{`
        .custom-map-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) !important;
          border: 1px solid rgba(2, 174, 239, 0.2) !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
      `}</style>
    </div>
  );
}
