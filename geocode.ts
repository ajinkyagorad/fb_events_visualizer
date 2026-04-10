import fs from 'fs';

const locations = [
  "Meilahden kartano", "Lapinlahdenpolku 8", "Uudenmaankatu 33", "Kustaankatu 3", "Turunlinnantie 1",
  "Helsingin Tanssikeskus", "Kompassitori", "Hyväntoivonkatu 5", "Siilitie 18c", "Konepajanpasaasi",
  "Malmitalo", "Pasilan kirjasto", "Rosebud Books", "Työväenopiston Opistotalo", "Suomalaisen Kirjallisuuden Seura",
  "TAVASTIA-klubi", "Pirunkirkko", "Stockmann", "Telakkakatu 7", "Ravintola Oiva", "Koroistentie 6 A",
  "Mäkelänkatu 56", "Kallion kirjasto", "Iso Roobertinkatu 3-5", "Bar Loose", "Viides linja 11",
  "Malminkatu 3", "Magito Studio", "Art Café Feeniks", "Pohjoinen Hesperiankatu 7", "Klaneettitie 5",
  "Lintulahdenkatu 3", "Museokatu 10", "Teollisuuskatu 16", "Karjalankatu 2 A", "Korjaamo",
  "Länsisatamankatu 18", "Helsingin Kaupunginteatteri", "Arabiasali", "Heikkiläntie 2", "D-asema Kallio",
  "Lepakkomies", "Ravintola Viisipenniä", "Petter Wetterin tie", "Pohjois-Haagan kirjasto", "Vuosaaren kirjasto",
  "Ateneuminkuja 2", "Haapaniemenkatu 6", "Aivovammaliitto ry", "Aleksanterinkatu 28", "Molly Malone's Helsinki",
  "Kristianinkatu 16", "Helsinki Congress Paasitorni", "FÖÖNI", "Myllypuron kirjasto", "Intiankatu 28",
  "Paasivaarankatu 6", "Cable Factory", "Tapulikaupungin kirjasto", "Kalasataman Vapaakaupunki", "Tammisaaren Palloiluhalli",
  "Rauhankatu 7", "Myllypurontie 22", "Fabianinkatu 6", "Maunulan kirjasto", "Liszt-instituutti Helsinki",
  "Jätkäsaaren kirjasto", "Kalevankatu 16", "Herttoniemen kirjasto", "Yrjönkatu 22", "Mosaiikkitori",
  "Puotilantie 3", "Unikkotie 8", "Ruoholahdenranta 3 A", "Oksasenkatu 11", "Hämeentie 28",
  "Eteläranta 12", "Uudenmaankatu 23 F", "Punkmuseo", "Pasilan Asema-aukio 1 A", "Naapuruustalo Pasila",
  "Hallituskatu 1", "Konalantie 47 B", "Oulunkylän kirjasto", "Meritullin Seurakuntatalo", "Malmin raitti 17 A",
  "Jämsänkatu 2 C", "Teollisuuskatu 9d", "Viikintie 1 D", "Kaisaniemenkatu 8", "Uspenskin katedraali",
  "Konepajanpasaasi 2", "Postitalo", "Kopernikuksentie 1", "Fredrikinkatu 43", "Rikhardinkadun kirjasto",
  "Bulevardi 10", "Salomonkatu 21B", "Dagmarinkatu 2", "Antinkatu 3", "Metsäpurontie 25",
  "Koetilantie 1", "Kaisaniemen Kasvitieteellinen Puutarha", "Puukoulu", "Pyhän Sydämen Kappeli", "Stoa",
  "Siltavuorenranta 18", "Oranssi ry", "Hämeentie 135", "Sturenkatu 4", "Kinaporinkatu 5",
  "Bruno Granholminkuja 3", "Riihitie 22", "Musiikkiteatteri Kapsäkki", "Kraken - Helsinki", "Tukholmankatu 10",
  "Asiakkaankatu 3", "Etelä-Haagan kirjasto", "Viikin kirjasto", "El Ático Helsinki", "Pursimiehenkatu 5",
  "Puistolan kirjasto", "Suutarilan kirjasto", "Kulttuuritalo", "Itäinen Teatterikuja 3", "Pasilan Juna-Asema",
  "Bulevardi", "Topeliuksenkatu 1", "Mikonkatu 8", "Semifinal", "Tanssin talo",
  "Konepajan Näyttämö", "Paavalinkirkko", "Helsinginkatu 58", "Hämeentie 3", "Musta Kissa",
  "Mikonkatu 15", "Georgsgatan 27", "Vironkatu 7", "Ala-Malmin tori 1", "Muotoilijankatu 1 B",
  "Luiskatie 8", "Töölönkatu 51", "B-Side Bar", "Museokatu 8", "Kaivokatu 6",
  "Ravintola Maxine", "Helsinki Oriental", "Helsinki Dance Central"
];

async function geocode() {
  const results: Record<string, {lat: number, lng: number}> = {};
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    try {
      const query = encodeURIComponent(`${loc}, Helsinki, Finland`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: {
          'User-Agent': 'AI-Studio-App/1.0'
        }
      });
      const data = await res.json();
      
      if (data && data.length > 0) {
        results[loc] = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log(`✅ ${loc}: ${data[0].lat}, ${data[0].lon}`);
      } else {
        console.log(`❌ ${loc}: Not found`);
      }
    } catch (e) {
      console.error(`Error for ${loc}:`, e);
    }
    
    // Wait 1 second to respect Nominatim limits
    await new Promise(r => setTimeout(r, 1000));
  }
  
  fs.writeFileSync('location_coords.json', JSON.stringify(results, null, 2));
  console.log('Done! Saved to location_coords.json');
}

geocode();
