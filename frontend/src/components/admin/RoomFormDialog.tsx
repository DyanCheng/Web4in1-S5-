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

export interface RoomFormData {
  name: string;
  type: string;
  price: number;
  beds: number;
  guests: number;
  status: string;
}

export interface RoomRecord extends RoomFormData {
  id: number;
}

const emptyForm: RoomFormData = {
  name: '',
  type: 'Standard',
  price: 0,
  beds: 1,
  guests: 2,
  status: 'available',
};

export function roomToForm(room: RoomRecord): RoomFormData {
  return {
    name: room.name,
    type: room.type,
    price: room.price,
    beds: room.beds,
    guests: room.guests,
    status: room.status,
  };
}

export function formToPayload(form: RoomFormData) {
  return {
    name: form.name,
    type: form.type,
    price: Number(form.price),
    beds: Number(form.beds),
    guests: Number(form.guests),
    status: form.status,
  };
}

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: RoomRecord | null;
  onSubmit: (payload: ReturnType<typeof formToPayload>) => Promise<void>;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-400';

export default function RoomFormDialog({ open, onOpenChange, initial, onSubmit }: RoomFormDialogProps) {
  const [form, setForm] = useState<RoomFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial ? roomToForm(initial) : emptyForm);
      setError('');
    }
  }, [open, initial]);

  const handleChange = (field: keyof RoomFormData, value: string | number) => {
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
      setError(err instanceof Error ? err.message : 'Lưu phòng thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black font-serif">
            {initial ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tên phòng *</span>
            <input required value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Phòng 101" className={`${inputClass} mt-1`} />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Loại phòng *</span>
              <select required value={form.type} onChange={(e) => handleChange('type', e.target.value)} className={`${inputClass} mt-1`}>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Family">Family</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Giá mỗi đêm (VNĐ) *</span>
              <input required type="number" min={0} value={form.price || ''} onChange={(e) => handleChange('price', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Số giường *</span>
              <input required type="number" min={1} value={form.beds} onChange={(e) => handleChange('beds', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sức chứa (Khách) *</span>
              <input required type="number" min={1} value={form.guests} onChange={(e) => handleChange('guests', Number(e.target.value))} className={`${inputClass} mt-1`} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái *</span>
            <select required value={form.status} onChange={(e) => handleChange('status', e.target.value)} className={`${inputClass} mt-1`}>
              <option value="available">Trống</option>
              <option value="booked">Đã đặt</option>
            </select>
          </label>

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
              {initial ? 'Cập nhật' : 'Thêm phòng'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
