'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Event } from '@/lib/parseEvents';
import { MapPin, Users, ExternalLink, Calendar, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center border border-slate-200">
      <div className="text-slate-400 font-medium">Loading map...</div>
    </div>
  )
});

interface VisualizerProps {
  events: Event[];
}

export function Visualizer({ events }: VisualizerProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');

  const previousEvents = useMemo(() => events.filter(e => e.category === 'previous'), [events]);
  const todayEvents = useMemo(() => {
    const today = events.filter(e => e.category === 'today');
    return today.sort((a, b) => (a.timeValue || 0) - (b.timeValue || 0));
  }, [events]);
  const happeningNowEvents = useMemo(() => events.filter(e => e.category === 'happening_now'), [events]);
  const futureEvents = useMemo(() => events.filter(e => e.category === 'future'), [events]);

  // Group today's events by time
  const todayByTime = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    todayEvents.forEach(e => {
      const t = e.time || 'All Day';
      if (!grouped[t]) grouped[t] = [];
      grouped[t].push(e);
    });
    return grouped;
  }, [todayEvents]);

  const EventCard = ({ event, className }: { event: Event; className?: string }) => (
    <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 p-3 hover:shadow-md transition-shadow flex flex-col", className)}>
      {event.imageUrl && (
        <div className="w-full h-32 mb-3 rounded-lg overflow-hidden shrink-0 relative bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      )}
      <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2" title={event.title}>{event.title}</h4>
      <div className="space-y-1.5 text-xs text-slate-600">
        {event.location && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1" title={event.location}>{event.location}</span>
          </div>
        )}
        {event.attendees && (
          <div className="flex items-start gap-1.5">
            <Users className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <span>{event.attendees}</span>
          </div>
        )}
      </div>
      {event.link && (
        <a 
          href={event.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          View Event <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="bg-[#3b5998] text-white py-4 px-6 rounded-2xl shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#3b5998] font-bold text-xl">f</div>
            <h1 className="text-2xl font-bold tracking-tight">HELSINKI EVENTS: APRIL 2026</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-blue-100 font-medium text-sm">{events.length} Events Total</div>
            
            <div className="flex bg-blue-900/40 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('timeline')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'timeline' ? "bg-white text-[#3b5998] shadow-sm" : "text-blue-100 hover:text-white hover:bg-white/10"
                )}
              >
                <ListIcon className="w-4 h-4" /> Timeline
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'map' ? "bg-white text-[#3b5998] shadow-sm" : "text-blue-100 hover:text-white hover:bg-white/10"
                )}
              >
                <MapIcon className="w-4 h-4" /> Map
              </button>
            </div>
          </div>
        </header>

        {viewMode === 'map' ? (
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
            <div className="mb-4 px-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Interactive Event Map</h2>
              <p className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                * Locations are deterministically simulated for demonstration
              </p>
            </div>
            <MapView events={events} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Previous Events */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-slate-100 rounded-2xl p-4 h-full border border-slate-200">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">April 8th</h2>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Previous Events</h3>
                </div>
                <div className="space-y-3">
                  {previousEvents.map(event => (
                    <EventCard key={event.id} event={event} className="bg-orange-50/50 border-orange-100" />
                  ))}
                  {previousEvents.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-8">No previous events</div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: Today's Events Timeline */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider">April 9th (Today)</h2>
                </div>
                
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#3b5998] -translate-x-1/2 rounded-full"></div>
                  
                  <div className="space-y-8">
                    {Object.entries(todayByTime).map(([time, timeEvents], index) => (
                      <div key={time} className="relative flex items-center justify-center">
                        {/* Time Badge */}
                        <div className="absolute left-1/2 -translate-x-1/2 z-10 bg-[#3b5998] text-white px-3 py-1 rounded-full text-sm font-bold shadow-md whitespace-nowrap">
                          {time}
                        </div>
                        
                        <div className="w-full flex justify-between gap-8">
                          {/* Left Side Events */}
                          <div className="w-1/2 pr-8 flex flex-col gap-3 items-end">
                            {timeEvents.filter((_, i) => i % 2 === 0).map(event => (
                              <EventCard key={event.id} event={event} className="w-full max-w-sm" />
                            ))}
                          </div>
                          
                          {/* Right Side Events */}
                          <div className="w-1/2 pl-8 flex flex-col gap-3 items-start">
                            {timeEvents.filter((_, i) => i % 2 !== 0).map(event => (
                              <EventCard key={event.id} event={event} className="w-full max-w-sm" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {Object.keys(todayByTime).length === 0 && (
                      <div className="text-center text-slate-400 py-12 relative z-10 bg-white/80">No events today</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Future & Recurring */}
            <div className="lg:col-span-3 space-y-6">
              {/* Happening Now */}
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
                <div className="text-center mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Happening Now</h2>
                </div>
                <div className="space-y-3">
                  {happeningNowEvents.map(event => (
                    <EventCard key={event.id} event={event} className="border-green-200 bg-green-50/30" />
                  ))}
                  {happeningNowEvents.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-4">Nothing happening right now</div>
                  )}
                </div>
              </div>

              {/* Future Events */}
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
                <div className="text-center mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Future & Recurring</h2>
                </div>
                <div className="space-y-3">
                  {futureEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex gap-3">
                      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-200 p-2 min-w-[3rem]">
                        <Calendar className="w-4 h-4 text-red-500 mb-1" />
                        <span className="text-xs font-bold text-slate-800 text-center leading-tight">
                          {event.dateStr.split(',')[0]}<br/>
                          {event.dateStr.split(' ')[2]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm line-clamp-2" title={event.title}>{event.title}</h4>
                        {event.location && (
                          <p className="text-xs text-slate-500 truncate mt-1">{event.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {futureEvents.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-4">No future events</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
