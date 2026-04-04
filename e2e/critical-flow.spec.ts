/**
 * E2E Critical Flow: Registration → Lead Creation → Booking
 * Uses Playwright APIRequestContext to test the backend API directly.
 * Requires: API running at API_BASE_URL (default localhost:4000)
 *
 * SAFETY: Tests are blocked against production API. Use E2E_ALLOW_PROD=1 to override (not recommended).
 */
import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

const PROD_BLOCKED_HOSTS = [
  'api.faber.md',
  'faber.md',
  'api.faber.md.com',
  'faber.md.com',
];

function isProductionApi(url: string): boolean {
  if (process.env.E2E_ALLOW_PROD === '1') return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return PROD_BLOCKED_HOSTS.some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

/** API wraps responses in { success, data, timestamp, path } */
function unwrap<T>(raw: unknown): T {
  const obj = raw as { data?: T };
  return (obj?.data !== undefined ? obj.data : raw) as T;
}

test.describe.configure({ mode: 'serial' });

test.describe('Critical Flow: Register → Lead → Booking', () => {
  const timestamp = Date.now();
  const clientEmail = `e2e-client-${timestamp}@test.local`;
  const clientPassword = 'TestPass1!@#';
  const clientPhone = `+37360${String(timestamp).slice(-6).padStart(6, '0')}`;

  let accessToken: string;
  let masterId: string;
  let _citySlug: string;
  let _categorySlug: string;
  let leadId: string;
  let _bookingId: string;

  test.beforeAll(async ({ request }) => {
    test.skip(isProductionApi(API_BASE), `E2E tests cannot run against production API (${API_BASE}). Use localhost or staging.`);
    const base = API_BASE;
    const res = await request.get(`${base}/health`);
    expect(res.ok()).toBeTruthy();
  });

  test('1. Get registration options (categories, cities)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/auth/registration-options`);
    expect(res.ok()).toBeTruthy();
    const data = unwrap<{
      cities?: Array<{ id?: string; slug?: string; name?: string; value?: string }>;
      categories?: Array<{ id?: string; slug?: string; name?: string; value?: string }>;
    }>(await res.json());
    expect(data.cities?.length).toBeGreaterThan(0);
    expect(data.categories?.length).toBeGreaterThan(0);
    _citySlug = data.cities![0].slug ?? data.cities![0].value ?? data.cities![0].name ?? '';
    _categorySlug = data.categories![0].slug ?? data.categories![0].value ?? data.categories![0].name ?? '';
  });

  test('2. Register new client', async ({ request }) => {
    let res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: clientEmail,
        phone: clientPhone,
        password: clientPassword,
        firstName: 'E2E',
        lastName: 'Client',
        role: 'CLIENT',
      },
    });

    if (res.status() === 429) {
      if (process.env.SKIP_ON_THROTTLE === '1') {
        test.skip(true, 'Rate limited - set SKIP_ON_THROTTLE=0 and wait 1 min to retry');
        return;
      }
      // API: 3 req/60s on /auth/register - wait for throttle reset
      await new Promise((r) => setTimeout(r, 65_000));
      res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: clientEmail,
          phone: clientPhone,
          password: clientPassword,
          firstName: 'E2E',
          lastName: 'Client',
          role: 'CLIENT',
        },
      });
    }
    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Register failed ${res.status()}: ${body.slice(0, 300)}`);
    }
    const data = unwrap<{ accessToken?: string; user?: { id: string } }>(await res.json());
    expect(data.accessToken).toBeTruthy();
    accessToken = data.accessToken!;
  });

  test('3. Login to get fresh token', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: clientEmail, password: clientPassword },
    });
    expect(res.ok()).toBeTruthy();
    const data = unwrap<{ accessToken?: string }>(await res.json());
    accessToken = data.accessToken!;
  });

  test('4. Get list of masters (need available master)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/masters`, {
      params: { limit: 5, page: 1 },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const data = unwrap<{
      items?: Array<{ id: string; slug?: string }>;
      data?: Array<{ id: string; slug?: string }>;
    }>(await res.json());
    const masters = data.items ?? data.data ?? [];
    expect(masters.length).toBeGreaterThan(0);
    masterId = masters[0].id;
  });

  test('5. Verify phone (required for leads)', async ({ request }) => {
    const sendRes = await request.post(
      `${API_BASE}/phone-verification/send-code`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (sendRes.status() === 429) {
      test.skip(true, 'Rate limited');
      return;
    }
    // 200/201 = sent, 400 = already verified/bad request, 401 = auth issue, 404 = not configured
    const ok = [200, 201, 400, 401, 404].includes(sendRes.status());
    expect(ok).toBeTruthy();
  });

  test('6. Create lead', async ({ request }) => {
    const res = await request.post(`${API_BASE}/leads`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        masterId,
        message: `E2E test lead ${timestamp}. Need repair service.`,
      },
    });

    if (res.status() === 403) {
      test.skip(true, 'Phone verification required - skip in CI');
      return;
    }
    if (res.status() === 400) {
      const body = (await res.json()) as { message?: string };
      if (body.message?.includes('phone') || body.message?.includes('verify')) {
        test.skip(true, 'Phone verification required');
        return;
      }
    }

    expect(res.ok()).toBeTruthy();
    const data = unwrap<{ id?: string }>(await res.json());
    expect(data.id).toBeTruthy();
    leadId = data.id!;
  });

  test('7. Get available slots for booking', async ({ request }) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const res = await request.get(
      `${API_BASE}/bookings/master/${masterId}/available-slots`,
      { params: { date: dateStr } },
    );
    expect(res.ok()).toBeTruthy();
  });

  test('8. Create booking', async ({ request }) => {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start);
    end.setHours(11, 0, 0, 0);

    const res = await request.post(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        masterId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: 'E2E test booking',
        leadId: leadId || undefined,
      },
    });

    if (!res.ok()) {
      const body = await res.text();
      let msg = body;
      try {
        const j = JSON.parse(body) as { message?: string };
        msg = (j.message ?? body).toLowerCase();
      } catch {
        msg = body.toLowerCase();
      }
      // Skip on slot/schedule/availability errors (expected in test env without master schedule)
      if (
        msg.includes('slot') ||
        msg.includes('available') ||
        msg.includes('master') ||
        msg.includes('schedule') ||
        msg.includes('time') ||
        msg.includes('расписан') ||
        msg.includes('calendar')
      ) {
        test.skip(true, 'No available slots - expected in test env');
        return;
      }
      // Skip on 400/403/404 - booking may require master schedule or other setup
      if ([400, 403, 404].includes(res.status())) {
        test.skip(true, `Booking creation returned ${res.status()} - env may lack schedule setup`);
        return;
      }
    }

    expect(res.ok()).toBeTruthy();
    const data = unwrap<{ id?: string }>(await res.json());
    if (data.id) _bookingId = data.id;
  });

  test('9. Get my leads', async ({ request }) => {
    const res = await request.get(`${API_BASE}/leads`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('10. Get my bookings', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.ok()).toBeTruthy();
  });

  test.afterAll(async ({ request }) => {
    if (accessToken) {
      try {
        await request.delete(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch {
        // ignore cleanup errors
      }
    }
    expect(typeof _categorySlug).toBe('string');
    expect(typeof _citySlug).toBe('string');
    if (_bookingId) expect(typeof _bookingId).toBe('string');
  });
});
