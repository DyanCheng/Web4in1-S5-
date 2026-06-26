"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface TourFormData {
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  highlights: string;
  included: string;
  excluded: string;
}

export interface TourRecord extends Omit<TourFormData, 'highlights' | 'included' | 'excluded'> {
  id: string;
  highlights?: string[];
  included?: string[];
  excluded?: string[];
}

const emptyForm: TourFormData = {
  title: '',
  location: '',
  price: 0,
  duration: '',
  image: '',
  rating: 4.5,
  reviews: 0,
  description: '',
  highlights: '',
  included: '',
  excluded: '',
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

export function tourToForm(tour: TourRecord): TourFormData {
  return {
    title: tour.title,
    location: tour.location,
    price: tour.price,
    duration: tour.duration,
    image: tour.image,
    rating: tour.rating,
    reviews: tour.reviews,
    description: tour.description ?? '',
    highlights: joinLines(tour.highlights),
    included: joinLines(tour.included),
    excluded: joinLines(tour.excluded),
  };
}

export function formToPayload(form: TourFormData) {
  return {
    title: form.title,
    location: form.location,
    price: Number(form.price),
    duration: form.duration,
    image: form.image,
    rating: Number(form.rating),
    reviews: Number(form.reviews),
    description: form.description,
    highlights: splitLines(form.highlights),
    included: splitLines(form.included),
    excluded: splitLines(form.excluded),
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

  const handleChange = (field: keyof TourFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      <DialogContent aria-describedby={undefined} className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black font-serif">
            {initial ? 'Chỉnh sửa tour' : 'Thêm tour mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tên tour *</span>
              <input required value={form.title} onChange={(e) => handleChange('title', e.target.value)} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Địa điểm *</span>
              <input required value={form.location} onChange={(e) => handleChange('location', e.target.value)} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian *</span>
              <input required value={form.duration} onChange={(e) => handleChange('duration', e.target.value)} placeholder="3 ngày 2 đêm" className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Giá (VNĐ) *</span>
              <input required type="number" min={0} value={form.price || ''} onChange={(e) => handleChange('price', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">URL ảnh *</span>
              <input required value={form.image} onChange={(e) => handleChange('image', e.target.value)} placeholder="https://images.unsplash.com/..." className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Đánh giá *</span>
              <input required type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => handleChange('rating', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Số lượt đánh giá *</span>
              <input required type="number" min={0} value={form.reviews} onChange={(e) => handleChange('reviews', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả</span>
            <textarea rows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className={`${inputClass} mt-1 resize-none`} />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Điểm nổi bật</span>
              <textarea rows={4} value={form.highlights} onChange={(e) => handleChange('highlights', e.target.value)} placeholder="Mỗi dòng một mục" className={`${inputClass} mt-1 resize-none`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bao gồm</span>
              <textarea rows={4} value={form.included} onChange={(e) => handleChange('included', e.target.value)} placeholder="Mỗi dòng một mục" className={`${inputClass} mt-1 resize-none`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Không bao gồm</span>
              <textarea rows={4} value={form.excluded} onChange={(e) => handleChange('excluded', e.target.value)} placeholder="Mỗi dòng một mục" className={`${inputClass} mt-1 resize-none`} />
            </label>
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
