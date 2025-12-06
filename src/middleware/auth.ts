import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import type { Env } from '../env';
import { getSession, isSessionValid, deleteSession } from '../util/session';

function createLoginRedirectUrl(currentUrl: string): string {
	return `/auth/login?redirect=${encodeURIComponent(currentUrl)}`;
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
	try {
		const sessionId = getCookie(c, 'session_id');
		if (!sessionId) {
			return c.redirect(createLoginRedirectUrl(c.req.url));
		}

		const session = await getSession(c.env.KV, sessionId);
		if (!session) {
			return c.redirect(createLoginRedirectUrl(c.req.url));
		}

		if (!isSessionValid(session)) {
			await deleteSession(c.env.KV, sessionId);
			return c.redirect(createLoginRedirectUrl(c.req.url));
		}

		return await next();
	} catch (error) {
		console.error('Authentication error:', error);
		return c.redirect(createLoginRedirectUrl(c.req.url));
	}
}
