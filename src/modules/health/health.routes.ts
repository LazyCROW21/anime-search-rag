import { Hono } from 'hono';
import { healthController } from './health.controller';

const app = new Hono();

app.get('/', async (c) => {
    const result = await healthController.check();
    return c.json(result);
});

app.post('/reset', async (c) => {
    const result = await healthController.reset();
    return c.json(result);
});

export { app as healthRoutes };
