const fs = require('fs');

let content = fs.readFileSync('src/app/hotel/page.tsx', 'utf-8');

const typeDef = `export type Hotel = {
  id: string;
  name: string;
  location: string;
  area: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice?: number;
  badge?: string;
  stars: number;
  features: string[];
};`;

content = content.replace(/const hotels = \[\s*[\s\S]*?\];\s*type Hotel = \(typeof hotels\)\[number\];/, typeDef);

const stateEffect = `  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/hotels'))
      .then(res => res.json())
      .then(data => {
        setHotels(data);
        setIsLoadingHotels(false);
      })
      .catch(err => {
        console.error('Error fetching hotels:', err);
        setIsLoadingHotels(false);
      });
  }, []);`;

content = content.replace(/(export default function HotelPage\(\) \{[\s\S]*?const isMobile = useIsMobile\(\);)/, '$1\n' + stateEffect);

const hotelRoomsState = `  const [hotelRooms, setHotelRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  useEffect(() => {
    if (selectedHotel) {
      setIsLoadingRooms(true);
      fetch(apiUrl(\`/api/hotels/\${selectedHotel.id}/rooms\`))
        .then(res => res.json())
        .then(data => {
          setHotelRooms(data);
          setIsLoadingRooms(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingRooms(false);
        });
    } else {
      setHotelRooms([]);
    }
  }, [selectedHotel]);`;

content = content.replace(/const hotelRooms = useMemo\(\(\) => \{[\s\S]*?return \[[\s\S]*?\];\s*\}, \[selectedHotel\]\);/, hotelRoomsState);

if (!content.includes('apiUrl')) {
    content = content.replace("import { useEffect } from 'react';", "import { useEffect } from 'react';\nimport { apiUrl } from '@/lib/backendUrl';");
}

fs.writeFileSync('src/app/hotel/page.tsx', content);
