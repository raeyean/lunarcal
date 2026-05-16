import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  getDeityDay,
  DEITY_DAYS,
  DeityResponseSchema,
  DeityListResponseSchema,
} from '@lunarcal/shared';

const ErrorSchema = z.object({ error: z.string() });

const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['deity'],
  summary: 'List all deity days',
  description: 'Returns all known 神誕/佛誕/菩薩/道誕 days keyed by lunar month + day.',
  responses: {
    200: {
      content: { 'application/json': { schema: DeityListResponseSchema } },
      description: 'Array of all deity days',
    },
  },
});

const byDateRoute = createRoute({
  method: 'get',
  path: '/{lunarMonth}/{lunarDay}',
  tags: ['deity'],
  summary: 'Deity day for a lunar date',
  description: 'Returns the deity for the given lunar month + day, or null if none.',
  request: {
    params: z.object({
      lunarMonth: z.coerce.number().int().openapi({ example: 2 }),
      lunarDay: z.coerce.number().int().openapi({ example: 19 }),
    }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: DeityResponseSchema } },
      description: 'Deity object or null',
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Invalid lunar date params',
    },
  },
});

const deity = new OpenAPIHono();

deity.openapi(listRoute, (c) => {
  const days = Object.entries(DEITY_DAYS).map(([key, day]) => {
    const [lunarMonth, lunarDay] = key.split('-').map(Number);
    return { lunarMonth, lunarDay, ...day };
  });
  c.header('Cache-Control', 'public, max-age=604800, immutable');
  return c.json({ days }, 200);
});

deity.openapi(byDateRoute, (c) => {
  const { lunarMonth, lunarDay } = c.req.valid('param');

  if (lunarMonth < 1 || lunarMonth > 12 || lunarDay < 1 || lunarDay > 30) {
    return c.json({ error: 'Invalid lunar date' }, 400);
  }

  const day = getDeityDay(lunarMonth, lunarDay);
  c.header('Cache-Control', 'public, max-age=604800, immutable');
  return c.json({ deity: day }, 200);
});

export default deity;
