import React, { useState } from 'react';

interface RoomType {
  label: string;
  multiplier: number;
}

interface Hotel {
  name: string;
  price: number;
  image: string;
  // other fields omitted
}

interface RoomTypeModalProps {
  open: boolean;
  onClose: () => void;
  hotel: Hotel;
  onConfirm: (roomType: RoomType) => void;
}

const roomTypes: RoomType[] = [
  { label: 'Phòng tiêu chuẩn', multiplier: 1 },
  { label: 'Phòng cao cấp', multiplier: 1.2 },
  { label: 'Phòng VIP', multiplier: 1.5 },
];

export default function RoomTypeModal({ open, onClose, hotel, onConfirm }: RoomTypeModalProps) {
  const [selected, setSelected] = useState<RoomType>(roomTypes[0]);

  if (!open) return null;

  const formatVnd = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          ✕
        </button>
        <h2 className="mb-4 text-xl font-black text-gray-800 dark:text-gray-100">
          Chọn loại phòng cho {hotel.name}
        </h2>
        <div className="space-y-4">
          {roomTypes.map((type) => (
            <label key={type.label} className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{type.label}</span>
              <span className="text-sm font-black text-blue-700 dark:text-blue-300">
                {formatVnd(Math.round(hotel.price * type.multiplier))}/đêm
              </span>
              <input
                type="radio"
                name="roomType"
                checked={selected.label === type.label}
                onChange={() => setSelected(type)}
                className="size-4 accent-blue-600"
              />
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="px-4 py-2 text-sm font-black text-white bg-blue-700 rounded-md hover:bg-blue-800"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
