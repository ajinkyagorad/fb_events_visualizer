'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Event } from '@/lib/parseEvents';
import { MapPin, Users, ExternalLink, Calendar, Clock } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on category
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const icons = {
  previous: createIcon('#f97316'), // orange
  today_morning: createIcon('#3b82f6'), // blue
  today_afternoon: createIcon('#eab308'), // yellow
  today_evening: createIcon('#8b5cf6'), // purple
  happening_now: createIcon('#22c55e'), // green
  future: createIcon('#64748b'), // slate
};

const getIconForEvent = (event: Event) => {
  if (event.category === 'previous') return icons.previous;
  if (event.category === 'happening_now') return icons.happening_now;
  if (event.category === 'future') return icons.future;
  
  // Today's events
  if (event.timeValue !== undefined) {
    if (event.timeValue < 12 * 60) return icons.today_morning;
    if (event.timeValue < 17 * 60) return icons.today_afternoon;
    return icons.today_evening;
  }
  return icons.today_morning;
};

interface MapViewProps {
  events: Event[];
}

export default function MapView({ events }: MapViewProps) {
  // Helsinki center
  const center: [number, number] = [60.1699, 24.9384];

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {events.map(event => (
          <Marker 
            key={event.id} 
            position={[event.lat, event.lng]}
            icon={getIconForEvent(event)}
          >
            <Popup className="custom-popup">
              <div className="p-1 max-w-[250px]">
                {event.imageUrl && (
                  <div className="w-full h-24 mb-2 rounded-md overflow-hidden relative bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider
                    ${event.category === 'previous' ? 'bg-orange-500' : 
                      event.category === 'happening_now' ? 'bg-green-500' : 
                      event.category === 'future' ? 'bg-slate-500' : 'bg-blue-500'}`}
                  >
                    {event.category === 'today' ? (event.time || 'Today') : event.category.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-2 leading-tight">{event.title}</h4>
                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  {event.location && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.dateStr && (
                    <div className="flex items-start gap-1.5">
                      <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <span>{event.dateStr}</span>
                    </div>
                  )}
                </div>
                {event.link && (
                  <a 
                    href={event.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View Event <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 z-[1000] text-xs">
        <h4 className="font-bold text-slate-800 mb-2">Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-sm"></div><span>Previous</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div><span>Today (Morning)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow-sm"></div><span>Today (Afternoon)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500 border border-white shadow-sm"></div><span>Today (Evening)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></div><span>Happening Now</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500 border border-white shadow-sm"></div><span>Future</span></div>
        </div>
      </div>
    </div>
  );
}
