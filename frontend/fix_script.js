const fs = require('fs');
let content = fs.readFileSync('src/app/hotel/page.tsx', 'utf8');

// 1. apply fix_hotel.js logic
content = content.replace(/const hotels = \[\s*\{.*?\];\s*type Hotel = \(typeof hotels\)\[number\];/s, `export interface Hotel { id: string; name: string; location: string; area: string; image: string; rating: number; reviews: number; price: number; oldPrice?: number; badge?: string; stars: number; features: string[]; }
export interface HotelRoom { id: string; hotelId: string; name: string; image: string; maxAdults: number; maxChildren: number; beds: string; sizeSqm: number; price: number; taxAndFee: number; facilities: string[]; }`);

content = content.replace(/const hotelRooms = useMemo\(\(\) => \{.*?\}, \[selectedHotel\]\);/s, `const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
  useEffect(() => {
    async function fetchHotelRooms() {
      if (!selectedHotel) {
        setHotelRooms([]);
        return;
      }
      try {
        const res = await fetch(apiUrl(\`/api/hotels/\${selectedHotel.id}/rooms\`));
        if (res.ok) {
          const data = await res.json();
          setHotelRooms(data);
        }
      } catch (error) {
        console.error("Error fetching rooms", error);
      }
    }
    fetchHotelRooms();
  }, [selectedHotel]);`);

content = content.replace(/export default function HotelPage\(\) \{/, `export default function HotelPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch(apiUrl('/api/hotels'));
        if (res.ok) {
          const data = await res.json();
          setHotels(data);
        }
      } catch (error) {
        console.error("Error fetching hotels", error);
      } finally {
        setLoadingHotels(false);
      }
    }
    fetchHotels();
  }, []);`);

// 2. Add import apiUrl
content = content.replace("import { useEffect } from 'react';", "import { useEffect } from 'react';\nimport { apiUrl } from '@/lib/backendUrl';");

// 3. Fix filteredHotels dependency
content = content.replace("}, [searchDestination, maxPrice, selectedArea, selectedFacilities, selectedStars, sortMode]);", "}, [hotels, searchDestination, maxPrice, selectedArea, selectedFacilities, selectedStars, sortMode]);");

fs.writeFileSync('src/app/hotel/page.tsx', content, 'utf8');
