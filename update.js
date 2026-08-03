const fs = require('fs');
const path = 'd:/Web4in1-S5-/frontend/src/app/hotel/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useMemo, useState } from 'react';",
  "import { useMemo, useState, useEffect } from 'react';"
);

content = content.replace(
  "import { ImageWithFallback } from '@/components/figma/ImageWithFallback';",
  "import { ImageWithFallback } from '@/components/figma/ImageWithFallback';\nimport ReviewModal from '@/components/hotel/ReviewModal';\nimport { createClient } from '@/lib/supabase/client';"
);

content = content.replace(
  "  const [currentPage, setCurrentPage] = useState(1);\n  const [favorites, setFavorites] = useState<string[]>([]);",
    const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviewModalHotel, setReviewModalHotel] = useState<any | null>(null);
  const [reviewStats, setReviewStats] = useState<Record<string, { rating: number, count: number }>>({});

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      const { data } = await supabase.from('hotel_reviews').select('hotel_id, rating');
      if (data) {
        const stats = {};
        data.forEach((r) => {
          if (!stats[r.hotel_id]) stats[r.hotel_id] = { totalRating: 0, count: 0 };
          stats[r.hotel_id].totalRating += r.rating;
          stats[r.hotel_id].count += 1;
        });
        
        const finalStats = {};
        Object.keys(stats).forEach(id => {
          finalStats[id] = {
            rating: stats[id].totalRating / stats[id].count,
            count: stats[id].count
          };
        });
        setReviewStats(finalStats);
      }
    }
    fetchStats();
  }, []);
);

content = content.replace(
  "  const filteredHotels = useMemo(() => {\n    return hotels\n      .filter((hotel) => {",
    const filteredHotels = useMemo(() => {
    const hotelsWithRealStats = hotels.map(h => {
      const real = reviewStats[h.id];
      if (!real) return h;
      
      const totalReviews = h.reviews + real.count;
      const combinedRating = ((h.rating * h.reviews) + (real.rating * real.count)) / totalReviews;
      
      return {
        ...h,
        rating: Number(combinedRating.toFixed(1)),
        reviews: totalReviews
      };
    });

    return hotelsWithRealStats
      .filter((hotel) => {
);

const oldRating =                               <div className="shrink-0 text-center">
                                <div className="inline-flex min-w-[40px] items-center justify-center rounded-md bg-blue-700 px-2 py-1 text-sm font-black leading-none text-white">
                                  {hotel.rating.toFixed(1)}
                                </div>
                                <p className="mt-1 text-[11px] font-black text-blue-700 dark:text-blue-300">{getScoreLabel(hotel.rating)}</p>
                                <p className="text-[9px] font-semibold leading-tight text-slate-400">
                                  {hotel.reviews.toLocaleString('vi-VN')} người đánh giá
                                </p>
                              </div>;

const newRating =                               <div 
                                className="shrink-0 text-center cursor-pointer hover:opacity-80 transition-opacity" 
                                onClick={() => setReviewModalHotel(hotel)}
                                title="Nhấn để xem và viết đánh giá"
                              >
                                <div className="inline-flex min-w-[40px] items-center justify-center rounded-md bg-blue-700 px-2 py-1 text-sm font-black leading-none text-white">
                                  {hotel.rating.toFixed(1)}
                                </div>
                                <p className="mt-1 text-[11px] font-black text-blue-700 dark:text-blue-300">{getScoreLabel(hotel.rating)}</p>
                                <p className="text-[9px] font-semibold leading-tight text-slate-400 flex flex-col items-center">
                                  <span>{hotel.reviews.toLocaleString('vi-VN')} người đánh giá</span>
                                  <span className="text-blue-500 mt-0.5 underline">Xem đánh giá</span>
                                </p>
                              </div>;

content = content.replace(oldRating, newRating);

// Replace the end of the file
const endOfFilePattern = "        </DialogContent>\n      </Dialog>\n    </div>\n  );\n}";
const newEndOfFile =         </DialogContent>
      </Dialog>
      <ReviewModal 
        isOpen={!!reviewModalHotel} 
        onClose={() => setReviewModalHotel(null)} 
        hotel={reviewModalHotel} 
        onReviewAdded={(newReview) => {
          setReviewStats(prev => {
            const hId = newReview.hotel_id;
            const existing = prev[hId] || { rating: 0, count: 0 };
            const newCount = existing.count + 1;
            const newTotal = (existing.rating * existing.count) + newReview.rating;
            return {
              ...prev,
              [hId]: { rating: newTotal / newCount, count: newCount }
            };
          });
        }}
      />
    </div>
  );
};

content = content.replace(endOfFilePattern, newEndOfFile);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete');
