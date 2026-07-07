import re

with open('src/app/hotel/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace const hotels = [...]; with the type definition
type_def = '''export type Hotel = {
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
};'''

content = re.sub(r'const hotels = \[[\s\S]*?\];\s*type Hotel = \(typeof hotels\)\[number\];', type_def, content)

# Add state and useEffect inside HotelPage
state_effect = '''  const [hotels, setHotels] = useState<Hotel[]>([]);
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
  }, []);'''

content = re.sub(r'(export default function HotelPage\(\) \{[\s\S]*?const isMobile = useIsMobile\(\);)', r'\1\n' + state_effect, content)

# Replace hotelRooms
hotel_rooms_state = '''  const [hotelRooms, setHotelRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  useEffect(() => {
    if (selectedHotel) {
      setIsLoadingRooms(true);
      fetch(apiUrl(/api/hotels//rooms))
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
  }, [selectedHotel]);'''

content = re.sub(r'const hotelRooms = useMemo\(\(\) => \{[\s\S]*?return \[[\s\S]*?\];[\s\S]*?\}, \[selectedHotel\]\);', hotel_rooms_state, content)

# Add apiUrl import
if 'apiUrl' not in content:
    content = content.replace('import { useEffect } from \\'react\\';', 'import { useEffect } from \\'react\\';\\nimport { apiUrl } from \\'@/lib/backendUrl\\';')

with open('src/app/hotel/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
