"use client";

import { useState } from 'react';
import { Lock, Moon, CreditCard, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DarkModePaywallProps {
  open: boolean;
  onClose: () => void;
}

export function DarkModePaywall({ open, onClose }: DarkModePaywallProps) {
  const [paying, setPaying] = useState(false);
  const [declined, setDeclined] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPaying(false);
      setDeclined(false);
      onClose();
    }
  };

  const handlePay = () => {
    setPaying(true);
    setDeclined(false);
    window.setTimeout(() => {
      setPaying(false);
      setDeclined(true);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden" showCloseButton={false}>
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-8 pb-6 text-white">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Moon className="size-7 text-yellow-300" />
          </div>
          <DialogHeader className="text-center items-center gap-2">
            <DialogTitle className="text-xl font-black text-white tracking-tight">
              Dark Mode Premium
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-center text-sm">
              Màn hình tối là tính năng cao cấp. Mở khóa ngay với một khoản đầu tư nhỏ.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Phí mở khóa một lần
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">
              $499.99
            </p>
            <p className="mt-1 text-xs text-slate-500 font-semibold">
              ≈ 12.750.000₫ · không hoàn tiền · không đàm phán
            </p>
          </div>

          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <Lock className="size-4 mt-0.5 shrink-0 text-slate-400" />
              <span>Chế độ tối độc quyền, chỉ dành cho khách VIP thật sự VIP</span>
            </li>
            <li className="flex items-start gap-2">
              <CreditCard className="size-4 mt-0.5 shrink-0 text-slate-400" />
              <span>Thanh toán an toàn* (*không an toàn, cũng không hoạt động)</span>
            </li>
          </ul>

          {declined && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
              <XCircle className="size-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Thẻ bị từ chối</p>
                <p className="text-red-600/90 text-xs mt-0.5">
                  Có lẽ số dư của bạn chưa đủ… or dark mode không dành cho bạn. Hãy thử lại với thẻ khác (spoiler: cũng sẽ bị từ chối).
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t-0 bg-white sm:flex-col gap-2 p-4 sm:justify-stretch">
          <Button
            className="w-full h-11 font-bold bg-slate-900 hover:bg-slate-800 text-white"
            onClick={handlePay}
            disabled={paying}
          >
            {paying ? 'Đang xử lý…' : 'Thanh toán $499.99'}
          </Button>
          <Button
            variant="ghost"
            className="w-full h-10 font-semibold text-slate-500"
            onClick={() => handleOpenChange(false)}
            disabled={paying}
          >
            Để sau — tôi chịu sáng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
