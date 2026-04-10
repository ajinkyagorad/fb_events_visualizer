import locationCoords from './location_coords.json';

export interface Event {
  id: string;
  title: string;
  dateStr: string;
  location: string;
  description: string;
  link: string;
  attendees: string;
  category: 'previous' | 'today' | 'future' | 'happening_now';
  time?: string;
  timeValue?: number; // for sorting
  lat: number;
  lng: number;
  imageUrl?: string;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function parseJsonEvents(jsonEvents: any[]): Event[] {
  const events: Event[] = [];
  for (const item of jsonEvents) {
    let title = item.name || '';
    const dateLine = item.date || item.time_text || '';
    
    let locationLine = '';
    if (typeof item.location === 'string') {
      locationLine = item.location;
    } else if (item.location && item.location.query_string) {
      locationLine = item.location.query_string;
    }
    
    // Clean up title if it contains the dateLine or "Interested"
    if (dateLine && title.startsWith(dateLine)) {
      title = title.substring(dateLine.length).trim();
    }
    if (title.endsWith('Interested')) {
      title = title.substring(0, title.length - 'Interested'.length).trim();
    }
    
    const linkLine = item.url || '';
    const imageUrl = item.image_url || '';
    const attendeesLine = `${item.interested_count || 0} interested, ${item.going_count || 0} going`;
    const descLine = ''; 
    
    let category: Event['category'] = 'future';
    let time = '';
    let timeValue = 0;
    
    if (item.start_timestamp) {
      const date = new Date(item.start_timestamp);
      time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      timeValue = date.getHours() * 60 + date.getMinutes();
    }
    
    if (dateLine.includes('Happening now')) {
      category = 'happening_now';
    } else if (dateLine.includes('Today') || dateLine.includes('Apr 9') || dateLine.includes('Apr 10')) {
      category = 'today';
      if (!time) {
        const timeMatch = dateLine.match(/at\s+(\d+(?::\d+)?)\s*([AP]M)/i);
        if (timeMatch) {
          time = `${timeMatch[1]} ${timeMatch[2].toUpperCase()}`;
          let [hours, minutes] = timeMatch[1].split(':').map(Number);
          if (!minutes) minutes = 0;
          if (timeMatch[2].toUpperCase() === 'PM' && hours !== 12) hours += 12;
          if (timeMatch[2].toUpperCase() === 'AM' && hours === 12) hours = 0;
          timeValue = hours * 60 + minutes;
        }
      }
    } else if (dateLine.includes('Apr 8')) {
      category = 'previous';
    } else {
      category = 'future';
    }
    
    // Get real coordinates if available
    let lat = 60.1699;
    let lng = 24.9384;
    
    const cleanLoc = locationLine.split(',')[0].trim();
    const coordsMap = locationCoords as Record<string, {lat: number, lng: number}>;
    
    if (coordsMap[cleanLoc]) {
      const hash = hashString(title);
      const latOffset = (Math.sin(hash) * 0.0002);
      const lngOffset = (Math.cos(hash) * 0.0002);
      lat = coordsMap[cleanLoc].lat + latOffset;
      lng = coordsMap[cleanLoc].lng + lngOffset;
    } else {
      const hash = hashString(locationLine || title);
      const norm1 = Math.abs(Math.sin(hash));
      const norm2 = Math.abs(Math.cos(hash));
      lat = 60.14 + (norm1 * 0.08);
      lng = 24.85 + (norm2 * 0.20);
    }
    
    events.push({
      id: item.id || Math.random().toString(36).substr(2, 9),
      title,
      dateStr: dateLine,
      location: locationLine,
      description: descLine,
      link: linkLine,
      attendees: attendeesLine,
      category,
      time,
      timeValue,
      lat,
      lng,
      imageUrl
    });
  }
  return events;
}

export function parseEvents(text: string): Event[] {
  try {
    const data = JSON.parse(text);
    if (data && data.events && Array.isArray(data.events)) {
      return parseJsonEvents(data.events);
    }
  } catch (e) {
    // Not JSON, fallback to text parsing
  }

  const events: Event[] = [];
  const blocks = text.split(/\n(?=\d+\.\s)/);
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim());
    if (lines.length < 2) continue;
    
    const titleMatch = lines[0].match(/^\d+\.\s+(.*)$/);
    let title = titleMatch ? titleMatch[1] : lines[0];
    
    // Sometimes the location is appended to the title after a comma or @
    let extractedLocationFromTitle = '';
    if (title.includes('@')) {
      const parts = title.split('@');
      title = parts[0].trim();
      extractedLocationFromTitle = parts[1].trim();
    }
    
    const dateLine = lines.find(l => l.startsWith('📅'))?.replace('📅', '').trim() || '';
    let locationLine = lines.find(l => l.startsWith('📍'))?.replace('📍', '').trim() || '';
    const descLine = lines.find(l => l.startsWith('📝'))?.replace('📝', '').trim() || '';
    const linkLine = lines.find(l => l.startsWith('🔗'))?.replace('🔗', '').trim() || '';
    const attendeesLine = lines.find(l => l.startsWith('👥'))?.replace('👥', '').trim() || '';
    
    // Handle the new format where locationLine is just "Tomorrow at" or "Today at"
    if (locationLine.startsWith('Tomorrow at') || locationLine.startsWith('Today at') || locationLine === 'Location TBD') {
      // Try to extract location from the description line
      // The description line format is usually: Date Time Title Location [Interested/Going]
      // We can try to remove the Date, Time, and Title to get the Location
      let descWithoutDate = descLine;
      if (dateLine) {
        descWithoutDate = descWithoutDate.replace(dateLine, '').trim();
      }
      
      // Try to match the time pattern (e.g. "at 10 AM")
      const timePattern = /(?:at\s+)?(\d+(?::\d+)?\s*(?:AM|PM))/i;
      const timeMatch = descWithoutDate.match(timePattern);
      if (timeMatch) {
        descWithoutDate = descWithoutDate.replace(timeMatch[0], '').trim();
      }
      
      // Try to remove the title
      if (title && descWithoutDate.includes(title)) {
        descWithoutDate = descWithoutDate.replace(title, '').trim();
      }
      
      // Remove the "X interested · Y going" part
      descWithoutDate = descWithoutDate.replace(/\d+\s+interested\s*·\s*\d+\s+going.*$/, '').trim();
      descWithoutDate = descWithoutDate.replace(/\d+\s+going.*$/, '').trim();
      descWithoutDate = descWithoutDate.replace(/Interested\s*Share.*$/, '').trim();
      descWithoutDate = descWithoutDate.replace(/Interested$/, '').trim();
      
      if (descWithoutDate) {
        locationLine = descWithoutDate;
      } else if (extractedLocationFromTitle) {
        locationLine = extractedLocationFromTitle;
      }
    }
    
    // Clean up location line
    if (locationLine.startsWith('- ')) {
      locationLine = locationLine.substring(2).trim();
    }
    
    let category: Event['category'] = 'future';
    let time = '';
    let timeValue = 0;
    
    if (dateLine.includes('Apr 8') || dateLine.includes('Apr 9')) {
      category = 'previous';
    } else if (dateLine.includes('Today') || dateLine.includes('Apr 10')) {
      category = 'today';
      const timeMatch = dateLine.match(/at\s+(\d+(?::\d+)?)\s*([AP]M)/i) || descLine.match(/at\s+(\d+(?::\d+)?)\s*([AP]M)/i);
      if (timeMatch) {
        time = `${timeMatch[1]} ${timeMatch[2].toUpperCase()}`;
        
        let [hours, minutes] = timeMatch[1].split(':').map(Number);
        if (!minutes) minutes = 0;
        if (timeMatch[2].toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (timeMatch[2].toUpperCase() === 'AM' && hours === 12) hours = 0;
        timeValue = hours * 60 + minutes;
      }
    } else if (dateLine.includes('Happening now')) {
      category = 'happening_now';
    } else {
      category = 'future';
    }
    
    // Get real coordinates if available
    let lat = 60.1699;
    let lng = 24.9384;
    
    const cleanLoc = locationLine.split(',')[0].trim();
    const coordsMap = locationCoords as Record<string, {lat: number, lng: number}>;
    
    if (coordsMap[cleanLoc]) {
      // Add a tiny deterministic offset based on the event title so markers at the same location don't perfectly overlap
      const hash = hashString(title);
      const latOffset = (Math.sin(hash) * 0.0002);
      const lngOffset = (Math.cos(hash) * 0.0002);
      
      lat = coordsMap[cleanLoc].lat + latOffset;
      lng = coordsMap[cleanLoc].lng + lngOffset;
    } else {
      // Fallback to deterministic spread if not found
      const hash = hashString(locationLine || title);
      const norm1 = Math.abs(Math.sin(hash));
      const norm2 = Math.abs(Math.cos(hash));
      lat = 60.14 + (norm1 * 0.08);
      lng = 24.85 + (norm2 * 0.20);
    }
    
    events.push({
      id: Math.random().toString(36).substr(2, 9),
      title,
      dateStr: dateLine,
      location: locationLine,
      description: descLine,
      link: linkLine,
      attendees: attendeesLine,
      category,
      time,
      timeValue,
      lat,
      lng
    });
  }
  return events;
}
