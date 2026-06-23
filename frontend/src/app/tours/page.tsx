"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ToursRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/#tours');
  }, [router]);

  return null;
}
