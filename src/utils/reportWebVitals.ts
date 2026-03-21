import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { env } from '@/services/env';

function sendMetric(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  const url = `${env.apiUrl.replace(/\/api\/?$/, '')}/web-vitals`;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      url,
      new Blob([body], { type: 'application/json' }),
    );
  }
}

export function reportWebVitals() {
  onCLS(sendMetric);
  onINP(sendMetric);
  onLCP(sendMetric);
  onFCP(sendMetric);
  onTTFB(sendMetric);
}
