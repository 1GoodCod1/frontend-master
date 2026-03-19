import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

function sendMetric(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/web-vitals', body);
  }
}

export function reportWebVitals() {
  onCLS(sendMetric);
  onINP(sendMetric);
  onLCP(sendMetric);
  onFCP(sendMetric);
  onTTFB(sendMetric);
}
