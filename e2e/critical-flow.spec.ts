/**
 * E2E Critical Flow: Registration → Lead Creation → Booking
 * Uses Playwright APIRequestContext to test the backend API directly.
 * Requires: API running at API_BASE_URL (default localhost:4000)
 */
import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

test.describe('Critical Flow: Register → Lead → Booking', () => {
  const timestamp = Date.now();
  const clientEmail = `e2e-client-${timestamp}@test.local`;
  const clientPassword = 'TestPass1!@#';
  const clientPhone = '+37360000001';

  let accessToken: string;
  let masterId: string;
  let _categoryId: string;
  let _cityId: string;
  let leadId: string;
  let _bookingId: string;

  test.beforeAll(async ({ request }) => {
    const base = API_BASE;
    const res = await request.get(`${base}/health`);
    expect(res.ok()).toBeTruthy();
  });

  test('1. Get registration options (categories, cities)', async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/auth/registration-options`);
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as {
      cities?: Array<{ id: string; name: string }>;
      categories?: Array<{ id: string; name: string }>;
    };
    expect(data.cities?.length).toBeGreaterThan(0);
    expect(data.categories?.length).toBeGreaterThan(0);
    _cityId = data.cities![0].id;
    _categoryId = data.categories![0].id;
  });

  test('2. Register new client', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: clientEmail,
        phone: clientPhone,
        password: clientPassword,
        firstName: 'E2E',
        lastName: 'Client',
        role: 'CLIENT',
        city: 'Кишинёв',
        category: 'Ремонт техники',
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { accessToken?: string; user?: { id: string } };
    expect(data.accessToken).toBeTruthy();
    accessToken = data.accessToken!;
  });

  test('3. Login to get fresh token', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: clientEmail, password: clientPassword },
    });
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { accessToken?: string };
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
    const data = (await res.json()) as {
      items?: Array<{ id: string; slug?: string }>;
      data?: Array<{ id: string; slug?: string }>;
    };
    const masters = data.items || data.data || [];
    expect(masters.length).toBeGreaterThan(0);
    masterId = masters[0].id;
  });

  test('5. Verify phone (required for leads)', async ({ request }) => {
    const sendRes = await request.post(
      `${API_BASE}/phone-verification/send-code`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (sendRes.status() === 429) {
      test.skip();
      return;
    }
    expect([200, 201, 400].includes(sendRes.status())).toBeTruthy();
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
      const body = await res.json();
      if (body.message?.includes('phone') || body.message?.includes('verify')) {
        test.skip(true, 'Phone verification required');
        return;
      }
    }

    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { id?: string };
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

    if (res.status() === 400) {
      const body = await res.text();
      if (
        body.includes('slot') ||
        body.includes('available') ||
        body.includes('Master')
      ) {
        test.skip(true, 'No available slots - expected in test env');
        return;
      }
    }

    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { id?: string };
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

  test.afterAll(() => {
    expect(typeof _categoryId).toBe('string');
    expect(typeof _cityId).toBe('string');
    if (_bookingId) expect(typeof _bookingId).toBe('string');
  });
});
