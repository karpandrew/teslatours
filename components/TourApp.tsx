'use client';

import React, { useState, useEffect, useRef } from 'react';
import { tourData } from '../data/tourData';
import TourMap from './TourMap';

interface Position {
  latitude: number;
  longitude: number;
}

interface Stop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  narration: string;
  content: string;
  pointsOfInterest: string[];
}

export default function TourApp() {
  const [tourStarted, setTourStarted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [currentStop, setCurrentStop] = useState<Stop | null>(null);
  const [completedStops, setCompletedStops] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastSpokenStopRef = useRef<number | null>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (!tourStarted || !currentPosition) return;

    for (const stop of tourData.stops) {
      const distance = calculateDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        stop.lat,
        stop.lng
      );

      if (distance <= stop.radius && lastSpokenStopRef.current !== stop.id) {
        setCurrentStop(stop);
        speak(stop.narration);
        lastSpokenStopRef.current = stop.id;
        if (!completedStops.includes(stop.id)) {
          setCompletedStops(prev => [...prev, stop.id]);
        }
        break;
      }
    }
  }, [currentPosition, tourStarted, completedStops]);

  const startTour = () => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to access location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
      watchIdRef.current = watchId;
      setTourStarted(true);
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const stopTour = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    stopSpeaking();
    setTourStarted(false);
    setCurrentStop(null);
    setCompletedStops([]);
    lastSpokenStopRef.current = null;
  };

  const getNextStop = (): Stop | null => {
    const nextStop = tourData.stops.find(stop => !completedStops.includes(stop.id));
    return nextStop || null;
  };

  const nextStop = getNextStop();

  if (!tourStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{tourData.name}</h1>
          <p className="text-gray-600 mb-6 text-lg">{tourData.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-xl font-semibold text-gray-800">{tourData.estimatedTime}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Distance</p>
              <p className="text-xl font-semibold text-gray-800">{tourData.distance}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Tour Stops:</h2>
            <div className="space-y-2">
              {tourData.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 font-medium">{stop.name}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startTour}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors shadow-lg"
          >
            Start Tour
          </button>
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            Make sure location services are enabled
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{tourData.name}</h1>
            <p className="text-sm text-gray-600">
              Stop {completedStops.length} of {tourData.stops.length}
            </p>
          </div>
          <button
            onClick={stopTour}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            End Tour
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '500px' }}>
          <TourMap
            stops={tourData.stops}
            currentPosition={currentPosition}
            completedStops={completedStops}
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {currentStop ? (
            <>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{currentStop.name}</h2>
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm"
                    >
                      Stop Audio
                    </button>
                  )}
                </div>
                <div className="prose prose-sm text-gray-700 mb-4">
                  {currentStop.content.split('•').map((item, idx) => (
                    item.trim() && <p key={idx} className="mb-1">• {item.trim()}</p>
                  ))}
                </div>
              </div>

              {currentStop.pointsOfInterest.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Points of Interest:</h3>
                  <ul className="space-y-1">
                    {currentStop.pointsOfInterest.map((poi, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">▸</span>
                        {poi}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => speak(currentStop.narration)}
                disabled={isSpeaking}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isSpeaking ? 'Speaking...' : 'Replay Audio'}
              </button>
            </>
          ) : nextStop ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Next Stop</h2>
                <p className="text-xl text-gray-700 mb-2">{nextStop.name}</p>
                <p className="text-gray-600">
                  Navigate to the next stop to hear its narration
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-green-600 mb-4">Tour Complete!</h2>
              <p className="text-gray-700 mb-6">
                You've visited all {tourData.stops.length} stops on the {tourData.name}
              </p>
              <button
                onClick={stopTour}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                End Tour
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Tour Progress</span>
            <span className="text-sm text-gray-600">
              {completedStops.length}/{tourData.stops.length} stops
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedStops.length / tourData.stops.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
