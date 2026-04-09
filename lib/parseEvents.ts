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
}

export function parseEvents(text: string): Event[] {
  const events: Event[] = [];
  const blocks = text.split(/\n(?=\d+\.\s)/);
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim());
    if (lines.length < 2) continue;
    
    const titleMatch = lines[0].match(/^\d+\.\s+(.*)$/);
    const title = titleMatch ? titleMatch[1] : lines[0];
    
    const dateLine = lines.find(l => l.startsWith('📅'))?.replace('📅', '').trim() || '';
    const locationLine = lines.find(l => l.startsWith('📍'))?.replace('📍', '').trim() || '';
    const descLine = lines.find(l => l.startsWith('📝'))?.replace('📝', '').trim() || '';
    const linkLine = lines.find(l => l.startsWith('🔗'))?.replace('🔗', '').trim() || '';
    const attendeesLine = lines.find(l => l.startsWith('👥'))?.replace('👥', '').trim() || '';
    
    let category: Event['category'] = 'future';
    let time = '';
    let timeValue = 0;
    
    if (dateLine.includes('Apr 8')) {
      category = 'previous';
    } else if (dateLine.includes('Today') || dateLine.includes('Apr 9')) {
      category = 'today';
      const timeMatch = dateLine.match(/at\s+(\d+(?::\d+)?)\s*([AP]M)/i);
      if (timeMatch) {
        time = `${timeMatch[1]} ${timeMatch[2].toUpperCase()}`;
        
        // Calculate timeValue for sorting
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
      timeValue
    });
  }
  return events;
}
