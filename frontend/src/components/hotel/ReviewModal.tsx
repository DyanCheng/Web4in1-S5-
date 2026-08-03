'use client';

import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: any;
  onReviewAdded: (newReview: any) => void;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
}

export default function ReviewModal({ isOpen, onClose, hotel, onReviewAdded }: ReviewModalProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasBooking, setHasBooking] = useState<boolean | null>(null);
  
  // Form state
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const supabase = createClient();

  useEffect(() => {
    if (user) {
      setUserName(user.name || user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && hotel) {
      fetchReviews();
      checkBookingStatus();
    }
  }, [isOpen, hotel, user]);

  const checkBookingStatus = async () => {
    if (!user) {
      setHasBooking(false);
      return;
    }
    
    // Check if user has a confirmed booking for this hotel
    const { data, error } = await supabase
      .from('hotel_bookings')
      .select('booking_status, payment_status')
      .eq('hotel_id', hotel.id)
      .eq('user_id', user.id);
      
    if (data && !error) {
      const validStatuses = ['confirmed', 'completed', 'paid', 'success'];
      const hasValid = data.some((b: any) => 
        validStatuses.includes(b.booking_status?.toLowerCase()) ||
        validStatuses.includes(b.payment_status?.toLowerCase())
      );
      setHasBooking(hasValid);
    } else {
      console.error("Booking check error:", error);
      setHasBooking(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hotel_reviews')
      .select('*')
      .eq('hotel_id', hotel.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !content.trim()) return;
    if (!hasBooking) {
      alert("Bạn cần đặt phòng thành công mới được đánh giá.");
      return;
    }

    setSubmitting(true);
    const newReview = {
      hotel_id: hotel.id,
      user_name: userName,
      rating,
      content,
    };

    const { data, error } = await supabase
      .from('hotel_reviews')
      .insert([newReview])
      .select();

    if (data && !error) {
      setReviews([data[0], ...reviews]);
      setContent('');
      setRating(5);
      onReviewAdded(data[0]);
    } else if (error) {
      const errorMsg = error.message || JSON.stringify(error);
      alert("Lỗi khi gửi đánh giá: " + errorMsg);
      console.error("Supabase Error: ", error);
    }
    setSubmitting(false);
  };

  if (!isOpen || !hotel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl dark:bg-slate-900 sm:h-[600px]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white">
              Đánh giá {hotel.name}
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Cộng đồng đánh giá thực tế
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-8 sm:grid-cols-2">
            
            {/* Left: Reviews List */}
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Tất cả đánh giá ({reviews.length})
              </h3>
              
              {loading ? (
                <div className="text-sm font-semibold text-slate-500">Đang tải...</div>
              ) : reviews.length === 0 ? (
                <div className="text-sm font-semibold text-slate-500">Chưa có đánh giá nào từ cộng đồng. Hãy là người đầu tiên!</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{r.user_name}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`size-3 ${i < r.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {format(new Date(r.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </p>
                      <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {r.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Write Review */}
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Viết đánh giá
              </h3>
              {!user ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm font-semibold text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-300">
                  Vui lòng đăng nhập để viết đánh giá cho khách sạn này.
                </div>
              ) : hasBooking === null ? (
                <div className="text-sm font-semibold text-slate-500">Đang kiểm tra quyền đánh giá...</div>
              ) : !hasBooking ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-sm font-semibold text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
                  Bạn chỉ có thể đánh giá sau khi đã đặt phòng thành công tại khách sạn này.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên của bạn</label>
                    <input
                      required
                      type="text"
                      value={userName}
                      disabled
                      className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Điểm đánh giá</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                        >
                          <Star className="size-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nội dung</label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                      rows={4}
                      className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
