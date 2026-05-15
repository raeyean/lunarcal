import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { onRequest } from 'firebase-functions/v2/https';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import yiji from './routes/yiji';
import directions from './routes/directions';
import deity from './routes/deity';

const app = new OpenAPIHono().basePath('/api');

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  maxAge: 86400,
}));

app.route('/yiji', yiji);
app.route('/directions', directions);
app.route('/deity', deity);

app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }));

// OpenAPI spec (JSON) + Swagger UI
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'LunarCal API',
    version: '1.0.0',
    description: 'REST API for 宜/忌, 方位, and 神誕 lunar calendar data.',
  },
});

app.get('/docs', swaggerUI({ url: '/api/openapi.json' }));

async function honoHandler(req: ExpressRequest, res: ExpressResponse): Promise<void> {
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https';
  const url = `${proto}://${req.hostname}${req.originalUrl ?? req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  const fetchReq = new Request(url, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method)
      ? undefined
      : JSON.stringify(req.body),
  });

  const honoRes = await app.fetch(fetchReq);

  res.status(honoRes.status);
  honoRes.headers.forEach((value: string, key: string) => res.setHeader(key, value));
  res.send(await honoRes.text());
}

export const api = onRequest({ region: 'asia-east1', invoker: 'public' }, honoHandler);

// Exported for tests (Hono app, bypassing Firebase wrapper).
export { app };
