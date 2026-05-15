import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getDayData, meaningsFor, YiJiResponseSchema } from '@lunarcal/shared';

const ParamsSchema = z.object({
  year: z.string().openapi({ example: '2026' }),
  month: z.string().openapi({ example: '5' }),
  day: z.string().openapi({ example: '15' }),
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
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);

  if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
    return c.json({ error: 'Invalid date' }, 400);
  }

  const data = getDayData(y, m, d);
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
