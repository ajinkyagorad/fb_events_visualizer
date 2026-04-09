'use client';

import { useState } from 'react';
import { Visualizer } from '@/components/Visualizer';
import { parseEvents, Event } from '@/lib/parseEvents';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [rawText, setRawText] = useState('');

  const handleParse = () => {
    const parsed = parseEvents(rawText);
    setEvents(parsed);
  };

  if (events.length > 0) {
    return (
      <div>
        <div className="fixed bottom-4 right-4 z-50">
          <button 
            onClick={() => setEvents([])}
            className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-slate-700 text-sm font-medium"
          >
            Load New Data
          </button>
        </div>
        <Visualizer events={events} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#3b5998] rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">f</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Helsinki Events Visualizer</h1>
          <p className="text-slate-500">Paste the raw events text below to generate the visualization.</p>
        </div>
        
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="1. Marileea Järnefelt Contemporary Art...&#10;📅 Fri, Apr 3&#10;📍 Location..."
          className="w-full h-64 p-4 border border-slate-300 rounded-xl mb-6 focus:ring-2 focus:ring-[#3b5998] focus:border-transparent outline-none resize-none font-mono text-sm"
        />
        
        <button
          onClick={handleParse}
          disabled={!rawText.trim()}
          className="w-full bg-[#3b5998] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#2d4373] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Visualization
        </button>
      </div>
    </div>
  );
}
