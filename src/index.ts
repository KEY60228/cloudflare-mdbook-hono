import { Hono } from 'hono';
import type { Env } from './env';
import { authMiddleware } from './middleware/auth';
import { handleLogin } from './handler/login';
import { handleCallback } from './handler/callback';
import { handleLogout } from './handler/logout';
import { handleServe } from './handler/serve';

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.text('OK'));

app.get('/auth/login', handleLogin);
app.get('/auth/callback', handleCallback);
app.get('/auth/logout', handleLogout);

app.use('*', authMiddleware);
app.get('*', handleServe);

app.onError((err, c) => {
	console.error('Unhandled error:', err);
	return c.text('Internal Server Error', 500);
});

app.notFound((c) => {
	return c.text('Page not found', 404);
});

export default app;
