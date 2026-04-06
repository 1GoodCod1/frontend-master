import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { env } from '@/services/env';

// Build the URL once: strip trailing /api/v1 (or /api) and append /api/v1/web-vitals
const WEB_VITALS_URL = (() => {
  const base = env.apiUrl.replace(/\/api(\/v\d+)?\/?$/, '');
  return `${base}/api/v1/web-vitals`;
})();

function sendMetric(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // fetch with keepalive is the recommended modern alternative to sendBeacon for JSON payloads.
  // sendBeacon with application/json triggers a CORS preflight which sendBeacon cannot handle.
  fetch(WEB_VITALS_URL, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {
    // Fire-and-forget: ignore errors, never block the user
  });
}

export function reportWebVitals() {
  onCLS(sendMetric);
  onINP(sendMetric);
  onLCP(sendMetric);
  onFCP(sendMetric);
  onTTFB(sendMetric);
}
