'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Stop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

interface Position {
  latitude: number;
  longitude: number;
}

interface TourMapProps {
  stops: Stop[];
  currentPosition: Position | null;
  completedStops: number[];
}

export default function TourMap({ stops, currentPosition, completedStops }: TourMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const currentPosMarkerRef = useRef<L.Marker | null>(null);
  const circlesRef = useRef<{ [key: number]: L.Circle }>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!mapRef.current) {
      const map = L.map('map').setView([34.4208, -119.6982], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    stops.forEach((stop) => {
      if (!markersRef.current[stop.id]) {
        const isCompleted = completedStops.includes(stop.id);
        const iconHtml = `
          <div style="
            background-color: ${isCompleted ? '#10b981' : '#3b82f6'};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            ${stop.id}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>${stop.name}</b>`);
        
        markersRef.current[stop.id] = marker;

        const circle = L.circle([stop.lat, stop.lng], {
          color: isCompleted ? '#10b981' : '#3b82f6',
          fillColor: isCompleted ? '#10b981' : '#3b82f6',
          fillOpacity: 0.1,
          radius: stop.radius,
        }).addTo(map);
        
        circlesRef.current[stop.id] = circle;
      } else {
        const isCompleted = completedStops.includes(stop.id);
        const iconHtml = `
          <div style="
            background-color: ${isCompleted ? '#10b981' : '#3b82f6'};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            ${stop.id}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        markersRef.current[stop.id].setIcon(customIcon);
        
        circlesRef.current[stop.id].setStyle({
          color: isCompleted ? '#10b981' : '#3b82f6',
          fillColor: isCompleted ? '#10b981' : '#3b82f6',
        });
      }
    });

    if (currentPosition) {
      const posIcon = L.divIcon({
        html: `
          <div style="
            background-color: #ef4444;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            animation: pulse 2s infinite;
          "></div>
        `,
        className: 'current-position-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (currentPosMarkerRef.current) {
        currentPosMarkerRef.current.setLatLng([currentPosition.latitude, currentPosition.longitude]);
      } else {
        currentPosMarkerRef.current = L.marker(
          [currentPosition.latitude, currentPosition.longitude],
          { icon: posIcon }
        ).addTo(map);
      }

      map.setView([currentPosition.latitude, currentPosition.longitude], map.getZoom());
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stops, currentPosition, completedStops]);

  return (
    <>
      <div id="map" style={{ width: '100%', height: '100%' }} />
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </>
  );
}
