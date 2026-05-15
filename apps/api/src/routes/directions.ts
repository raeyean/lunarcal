import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getDayData, DirectionsResponseSchema } from '@lunarcal/shared';

const ParamsSchema = z.object({
  year: z.string().openapi({ example: '2026' }),
  month: z.string().openapi({ example: '5' }),
  day: z.string().openapi({ example: '15' }),
});

const ErrorSchema = z.object({ error: z.string() });

const route = createRoute({
  method: 'get',
  path: '/{year}/{month}/{day}',
  tags: ['directions'],
  summary: '方位 (auspicious directions) for a solar date',
  description: 'Returns 5 directional keys (財神, 喜神, 福神, 陽貴, 陰貴) and their cardinal directions for the given solar date.',
  request: { params: ParamsSchema },
  responses: {
    200: {
      content: { 'application/json': { schema: DirectionsResponseSchema } },
      description: '5-key directions map',
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Invalid date params',
    },
  },
});

const directions = new OpenAPIHono();

directions.openapi(route, (c) => {
  const { year, month, day } = c.req.valid('param');
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);

  if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
    return c.json({ error: 'Invalid date' }, 400);
  }

  const data = getDayData(y, m, d);
  c.header('Cache-Control', 'public, max-age=86400, immutable');
  return c.json({
    directions: {
      財神: data.directions['財神'] ?? '',
      喜神: data.directions['喜神'] ?? '',
      福神: data.directions['福神'] ?? '',
      陽貴: data.directions['陽貴'] ?? '',
      陰貴: data.directions['陰貴'] ?? '',
    },
  }, 200);
});

export default directions;
