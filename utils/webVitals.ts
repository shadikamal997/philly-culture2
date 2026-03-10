import { onCLS, onFCP, onLCP, onTTFB, Metric as WebVitalsMetric } from 'web-vitals';

type Metric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
};

// Utility function to determine rating based on Core Web Vitals thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

// Report metrics to console in development, and could be extended to send to analytics service
const reportWebVitals = (metric: Metric) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', {
      name: metric.name,
      value: Math.round(metric.value * (metric.name === 'CLS' ? 1000 : 1)) / (metric.name === 'CLS' ? 1000 : 1),
      rating: metric.rating,
      timestamp: new Date().toISOString(),
    });
  }

  // TODO: Send to analytics service (e.g., Google Analytics, Mixpanel, etc.)
  // Example:
  // gtag('event', metric.name, {
  //   event_category: 'Web Vitals',
  //   event_label: metric.name,
  //   value: Math.round(metric.value),
  //   custom_map: { metric_rating: metric.rating }
  // });
};

// Initialize Core Web Vitals tracking
export function initWebVitals() {
  // Only track in browser environment
  if (typeof window === 'undefined') return;

  try {
    onCLS(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  } catch (error) {
    console.warn('Failed to initialize Web Vitals tracking:', error);
  }
}

// Utility function to manually report custom metrics
export function reportCustomMetric(name: string, value: number, rating?: 'good' | 'needs-improvement' | 'poor') {
  const metric: Metric = {
    name,
    value,
    rating: rating || getRating(name, value),
  };

  reportWebVitals(metric);
}