'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/utils/webVitals';

export default function WebVitals() {
  useEffect(() => {
    // Initialize Core Web Vitals tracking
    initWebVitals();
  }, []);

  // This component doesn't render anything
  return null;
}