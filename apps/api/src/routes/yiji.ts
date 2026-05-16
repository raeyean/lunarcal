import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getDayData, meaningsFor, YiJiResponseSchema } from '@lunarcal/shared';
import { isValidSolarDate } from '../utils/validation';

const ParamsSchema = z.object({
  year: z.coerce.number().int().openapi({ example: 2026 }),
  month: z.coerce.number().int().openapi({ example: 5 }),
  day: z.coerce.number().int().openapi({ example: 15 }),
});

const ErrorSchema = z.object({ error: z.string() });

const route = createRoute({
  method: 'get',
  path: '/{year}/{month}/{day}',
  tags: ['yiji'],
  summary: '宜/忌 for a solar date',
  description: 'Returns yi (auspicious) and ji (inauspicious) activity lists for the given solar date, each item annotated with its glossary description if known.',
  request: { params: ParamsSchema },
  responses: {
    200: {
      content: { 'application/json': { schema: YiJiResponseSchema } },
      description: 'Yi/Ji lists with descriptions',
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Invalid date params',
    },
  },
});

const yiji = new OpenAPIHono();

yiji.openapi(route, (c) => {
  const { year, month, day } = c.req.valid('param');

  if (!isValidSolarDate(year, month, day)) {
    return c.json({ error: 'Invalid date' }, 400);
  }

  const data = getDayData(year, month, day);
  const yiMeanings = meaningsFor(data.yi);
  const jiMeanings = meaningsFor(data.ji);

  const yi = data.yi.map(term => ({
    term,
    description: yiMeanings.find(mn => mn.name === term)?.meaning ?? null,
  }));
  const ji = data.ji.map(term => ({
    term,
    description: jiMeanings.find(mn => mn.name === term)?.meaning ?? null,
  }));

  c.header('Cache-Control', 'public, max-age=86400, immutable');
  return c.json({ yi, ji }, 200);
});

export default yiji;
