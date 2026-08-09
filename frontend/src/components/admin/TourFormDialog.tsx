"use client";

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface TourActivityForm {
  time: string;
  desc: string;
}

export interface TourItineraryDayForm {
  day: number;
  title: string;
  meals: string;
  accommodation: string;
  activities: TourActivityForm[];
}

export interface TourFormData {
  title: string;
  location: string;
  price: number;
  childPrice: number;
  durationDays: number;
  durationNights: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  highlights: string;
  included: string;
  excluded: string;
  itinerary: TourItineraryDayForm[];
}

export interface TourRecord {
  id: string;
  title: string;
  location: string;
  price: number;
  childPrice?: number;
  duration: string;
  durationDays?: number;
  durationNights?: number;
  image: string;
  rating: number;
  reviews: number;
  status?: boolean;
  description?: string;
  highlights?: string[];
  included?: string[];
  excluded?: string[];
  itinerary?: TourItineraryDayForm[];
}

function emptyDay(day: number): TourItineraryDayForm {
  return {
    day,
    title: `Ngày ${day}`,
    meals: '',
    accommodation: '',
    activities: [{ time: '08:00', desc: '' }],
  };
}

function buildItinerary(days: number, existing?: TourItineraryDayForm[]): TourItineraryDayForm[] {
  const safeDays = Math.max(days, 1);
  const byDay = new Map((existing ?? []).map((d) => [d.day, d]));
  return Array.from({ length: safeDays }, (_, i) => {
    const day = i + 1;
    return byDay.get(day) ?? emptyDay(day);
  });
}

function parseDuration(duration?: string, days?: number, nights?: number) {
  if (days && days > 0) {
    return { days, nights: nights ?? Math.max(days - 1, 0) };
  }
  const match = (duration ?? '').match(/(\d+)\s*ngày(?:\s*(\d+)\s*đêm)?/i);
  if (match) {
    const d = Number(match[1]) || 1;
    const n = match[2] != null ? Number(match[2]) : Math.max(d - 1, 0);
    return { days: d, nights: n };
  }
  return { days: 3, nights: 2 };
}

const emptyForm: TourFormData = {
  title: '',
  location: '',
  price: 0,
  childPrice: 0,
  durationDays: 3,
  durationNights: 2,
  image: '',
  rating: 4.5,
  reviews: 0,
  description: '',
  highlights: '',
  included: '',
  excluded: '',
  itinerary: buildItinerary(3),
};

function splitLines(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(items?: string[]) {
  return (items ?? []).join('\n');
}

function formatDuration(days: number, nights: number) {
  return `${days} ngày ${nights} đêm`;
}

export function tourToForm(tour: TourRecord): TourFormData {
  const { days, nights } = parseDuration(tour.duration, tour.durationDays, tour.durationNights);
  return {
    title: tour.title,
    location: tour.location,
    price: tour.price,
    childPrice: tour.childPrice ?? 0,
    durationDays: days,
    durationNights: nights,
    image: tour.image,
    rating: tour.rating,
    reviews: tour.reviews,
    description: tour.description ?? '',
    highlights: joinLines(tour.highlights),
    included: joinLines(tour.included),
    excluded: joinLines(tour.excluded),
    itinerary: buildItinerary(days, tour.itinerary),
  };
}

export function formToPayload(form: TourFormData) {
  return {
    title: form.title,
    location: form.location,
    price: Number(form.price),
    childPrice: Number(form.childPrice),
    duration: formatDuration(form.durationDays, form.durationNights),
    durationDays: Number(form.durationDays),
    durationNights: Number(form.durationNights),
    image: form.image,
    rating: Number(form.rating),
    reviews: Number(form.reviews),
    description: form.description,
    highlights: splitLines(form.highlights),
    included: splitLines(form.included),
    excluded: splitLines(form.excluded),
    itinerary: form.itinerary.map((day, index) => ({
      day: index + 1,
      title: day.title,
      meals: day.meals,
      accommodation: day.accommodation,
      activities: day.activities
        .filter((a) => a.time.trim() || a.desc.trim())
        .map((a) => ({ time: a.time.trim(), desc: a.desc.trim() })),
    })),
  };
}

interface TourFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: TourRecord | null;
  onSubmit: (payload: ReturnType<typeof formToPayload>) => Promise<void>;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-400';

export default function TourFormDialog({ open, onOpenChange, initial, onSubmit }: TourFormDialogProps) {
  const [form, setForm] = useState<TourFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial ? tourToForm(initial) : emptyForm);
      setError('');
    }
  }, [open, initial]);

  const handleChange = (field: keyof TourFormData, value: string | number | TourItineraryDayForm[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const syncDurationDays = (days: number) => {
    const safeDays = Math.max(1, days || 1);
    setForm((prev) => ({
      ...prev,
      durationDays: safeDays,
      durationNights: Math.min(prev.durationNights, Math.max(safeDays - 1, 0)),
      itinerary: buildItinerary(safeDays, prev.itinerary),
    }));
  };

  const updateDay = (index: number, patch: Partial<TourItineraryDayForm>) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    }));
  };

  const updateActivity = (dayIndex: number, activityIndex: number, patch: Partial<TourActivityForm>) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => {
        if (i !== dayIndex) return day;
        return {
          ...day,
          activities: day.activities.map((act, j) => (j === activityIndex ? { ...act, ...patch } : act)),
        };
      }),
    }));
  };

  const addActivity = (dayIndex: number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === dayIndex
          ? { ...day, activities: [...day.activities, { time: '', desc: '' }] }
          : day
      ),
    }));
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) => {
        if (i !== dayIndex) return day;
        const next = day.activities.filter((_, j) => j !== activityIndex);
        return { ...day, activities: next.length ? next : [{ time: '', desc: '' }] };
      }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(formToPayload(form));
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu tour thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black font-sans">
            {initial ? 'Chỉnh sửa tour' : 'Thêm tour mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tên tour *</span>
              <input required value={form.title} onChange={(e) => handleChange('title', e.target.value)} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Địa điểm *</span>
              <input required value={form.location} onChange={(e) => handleChange('location', e.target.value)} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">URL ảnh *</span>
              <input required value={form.image} onChange={(e) => handleChange('image', e.target.value)} placeholder="https://images.unsplash.com/..." className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Số ngày *</span>
              <input
                required
                type="number"
                min={1}
                value={form.durationDays}
                onChange={(e) => syncDurationDays(Number(e.target.value))}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Số đêm *</span>
              <input
                required
                type="number"
                min={0}
                value={form.durationNights}
                onChange={(e) => handleChange('durationNights', Math.max(0, Number(e.target.value)))}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Giá người lớn (VNĐ) *</span>
              <input required type="number" min={0} value={form.price || ''} onChange={(e) => handleChange('price', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Giá trẻ em dưới 12 tuổi (VNĐ) *</span>
              <input required type="number" min={0} value={form.childPrice || ''} onChange={(e) => handleChange('childPrice', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Đánh giá *</span>
              <input required type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => handleChange('rating', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Số lượt đánh giá *</span>
              <input required type="number" min={0} value={form.reviews} onChange={(e) => handleChange('reviews', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Thời lượng hiển thị: <span className="text-slate-800 dark:text-slate-200">{formatDuration(form.durationDays, form.durationNights)}</span> (giá trọn gói theo tour, không nhân theo ngày)
          </p>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mô tả</span>
            <textarea rows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className={`${inputClass} mt-1 resize-none`} />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Điểm nổi bật</span>
              <textarea rows={4} value={form.highlights} onChange={(e) => handleChange('highlights', e.target.value)} placeholder="Mỗi dòng một mục" className={`${inputClass} mt-1 resize-none`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bao gồm</span>
              <textarea rows={4} value={form.included} onChange={(e) => handleChange('included', e.target.value)} placeholder="Mỗi dòng một mục" className={`${inputClass} mt-1 resize-none`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Không bao gồm</span>
              <textarea rows={4} value={form.excluded} onChange={(e) => handleChange('excluded', e.target.value)} placeholder="Mỗi dòng một mục" className={`${inputClass} mt-1 resize-none`} />
            </label>
          </div>

          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">Lịch trình chi tiết</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Số ngày lịch trình tự theo thời lượng. Mỗi ngày có hoạt động theo giờ, bữa ăn và chỗ nghỉ.</p>
            </div>

            {form.itinerary.map((day, dayIndex) => (
              <div key={day.day} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/60 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-sm font-black">
                    {day.day}
                  </span>
                  <input
                    value={day.title}
                    onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                    placeholder={`Tiêu đề ngày ${day.day}`}
                    className={`${inputClass} flex-1`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bữa ăn</span>
                    <input
                      value={day.meals}
                      onChange={(e) => updateDay(dayIndex, { meals: e.target.value })}
                      placeholder="Sáng, Trưa, Tối"
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chỗ nghỉ</span>
                    <input
                      value={day.accommodation}
                      onChange={(e) => updateDay(dayIndex, { accommodation: e.target.value })}
                      placeholder="Khách sạn 4 sao / Du thuyền..."
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hoạt động theo giờ</span>
                  {day.activities.map((act, actIndex) => (
                    <div key={actIndex} className="flex gap-2 items-start">
                      <input
                        value={act.time}
                        onChange={(e) => updateActivity(dayIndex, actIndex, { time: e.target.value })}
                        placeholder="08:00"
                        className={`${inputClass} w-28 shrink-0`}
                      />
                      <input
                        value={act.desc}
                        onChange={(e) => updateActivity(dayIndex, actIndex, { desc: e.target.value })}
                        placeholder="Mô tả hoạt động"
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => removeActivity(dayIndex, actIndex)}
                        className="mt-1 rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        aria-label="Xóa hoạt động"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addActivity(dayIndex)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400"
                  >
                    <Plus className="size-3.5" /> Thêm hoạt động
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {initial ? 'Cập nhật' : 'Thêm tour'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
