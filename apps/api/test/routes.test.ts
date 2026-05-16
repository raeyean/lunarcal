import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import {
  YiJiResponseSchema,
  DirectionsResponseSchema,
  DeityResponseSchema,
  DeityListResponseSchema,
} from '@lunarcal/shared';

// Hono apps accept Request objects directly — no HTTP server needed.
async function get(path: string): Promise<{ status: number; body: unknown }> {
  const res = await app.request(path);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

describe('GET /api', () => {
  it('returns health payload', async () => {
    const { status, body } = await get('/api');
    expect(status).toBe(200);
    expect(body).toEqual({ status: 'ok', version: '1.0.0' });
  });
});

describe('GET /api/yiji/:y/:m/:d', () => {
  it('returns yi/ji arrays validated by schema', async () => {
    const { status, body } = await get('/api/yiji/2026/5/15');
    expect(status).toBe(200);
    const parsed = YiJiResponseSchema.parse(body);
    expect(Array.isArray(parsed.yi)).toBe(true);
    expect(Array.isArray(parsed.ji)).toBe(true);
    expect(parsed.yi.length).toBeGreaterThan(0);
  });

  it('attaches descriptions for known terms', async () => {
    const { body } = await get('/api/yiji/2026/5/15');
    const parsed = YiJiResponseSchema.parse(body);
    const withDescription = parsed.yi.filter(y => y.description !== null);
    expect(withDescription.length).toBeGreaterThan(0);
  });

  it('returns 400 for invalid date', async () => {
    const { status } = await get('/api/yiji/2026/13/40');
    expect(status).toBe(400);
  });

  it('returns 400 for non-numeric params', async () => {
    const { status } = await get('/api/yiji/abc/5/15');
    expect([400, 422]).toContain(status);
  });

  it('returns 400 for impossible day-of-month (Feb 30)', async () => {
    const { status } = await get('/api/yiji/2026/2/30');
    expect(status).toBe(400);
  });

  it('returns 400 for impossible day-of-month (Apr 31)', async () => {
    const { status } = await get('/api/yiji/2026/4/31');
    expect(status).toBe(400);
  });

  it('accepts Feb 29 in a leap year', async () => {
    const { status } = await get('/api/yiji/2028/2/29');
    expect(status).toBe(200);
  });

  it('rejects Feb 29 in a non-leap year', async () => {
    const { status } = await get('/api/yiji/2026/2/29');
    expect(status).toBe(400);
  });
});

describe('GET /api/directions/:y/:m/:d', () => {
  it('returns the 5 named directions', async () => {
    const { status, body } = await get('/api/directions/2026/5/15');
    expect(status).toBe(200);
    const parsed = DirectionsResponseSchema.parse(body);
    expect(Object.keys(parsed.directions).sort()).toEqual(
      ['財神', '喜神', '福神', '陽貴', '陰貴'].sort(),
    );
  });

  it('returns 400 for invalid date', async () => {
    const { status } = await get('/api/directions/2026/0/0');
    expect(status).toBe(400);
  });
});

describe('GET /api/deity', () => {
  it('returns the full deity list', async () => {
    const { status, body } = await get('/api/deity');
    expect(status).toBe(200);
    const parsed = DeityListResponseSchema.parse(body);
    expect(parsed.days.length).toBe(36);
  });

  it('every entry has valid kind', async () => {
    const { body } = await get('/api/deity');
    const parsed = DeityListResponseSchema.parse(body);
    parsed.days.forEach(d => {
      expect(['fo', 'pusa', 'shen', 'dao']).toContain(d.kind);
      expect(d.lunarMonth).toBeGreaterThan(0);
      expect(d.lunarDay).toBeGreaterThan(0);
    });
  });
});

describe('GET /api/deity/:lm/:ld', () => {
  it('returns 觀音菩薩聖誕 for 2/19', async () => {
    const { status, body } = await get('/api/deity/2/19');
    expect(status).toBe(200);
    const parsed = DeityResponseSchema.parse(body);
    expect(parsed.deity?.name).toBe('觀音菩薩聖誕');
    expect(parsed.deity?.kind).toBe('pusa');
  });

  it('returns null for a non-deity day', async () => {
    const { status, body } = await get('/api/deity/2/1');
    expect(status).toBe(200);
    const parsed = DeityResponseSchema.parse(body);
    expect(parsed.deity).toBeNull();
  });

  it('returns 400 for out-of-range lunar date', async () => {
    const { status } = await get('/api/deity/13/31');
    expect(status).toBe(400);
  });
});

describe('GET /api/openapi.json', () => {
  it('serves the OpenAPI spec', async () => {
    const { status, body } = await get('/api/openapi.json');
    expect(status).toBe(200);
    expect((body as { openapi: string }).openapi).toBe('3.0.0');
    expect((body as { info: { title: string } }).info.title).toBe('LunarCal API');
  });
});

describe('CORS preflight', () => {
  it('responds to OPTIONS with CORS headers', async () => {
    const res = await app.request('/api/yiji/2026/5/15', { method: 'OPTIONS' });
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});
