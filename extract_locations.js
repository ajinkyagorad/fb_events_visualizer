const fs = require('fs');

const text = fs.readFileSync('raw_events.txt', 'utf-8');
const blocks = text.split(/\n\n(?=\d+\.)/);
const locations = new Set();

for (const block of blocks) {
  const lines = block.split('\n');
  if (lines.length < 2) continue;
  
  // Try to find the location line
  let locationLine = lines.find(l => l.includes('📍'))?.replace('📍 ', '').trim() || '';
  
  // If the location line is just "Tomorrow at" or "Today at", we need to look closer at the raw text
  if (locationLine.startsWith('Tomorrow at') || locationLine.startsWith('Today at')) {
     // The actual location is often at the end of the title line or the description line
     const titleMatch = lines[0].match(/^\d+\.\s+(.*)$/);
     const title = titleMatch ? titleMatch[1] : '';
     
     // Try to extract location from description line
     const descLine = lines.find(l => l.includes('📝'))?.replace('📝 ', '').trim() || '';
     
     // This is a complex parsing problem because the format is inconsistent
     // Let's just try to grab the part after the time in the description
     const timeMatch = descLine.match(/(?:AM|PM)\s+(.*?)(?:\s+\d+\s+interested|\s+\d+\s+going|$)/);
     if (timeMatch && timeMatch[1]) {
        // The text after the title is usually the location
        const titleText = title.split('@')[0].trim(); // Remove @ Location from title if present
        let possibleLoc = timeMatch[1].replace(titleText, '').trim();
        if (possibleLoc.startsWith('- ')) possibleLoc = possibleLoc.substring(2).trim();
        if (possibleLoc) {
            locationLine = possibleLoc;
        }
     }
  }
  
  if (locationLine && locationLine !== 'Location TBD') {
    // Clean up location
    let loc = locationLine.split(',')[0].trim();
    locations.add(loc);
  }
}

console.log(Array.from(locations).join('\n'));
