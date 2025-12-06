import type { Context } from 'hono';
import { getCookie, deleteCookie } from 'hono/cookie';
import * as client from 'openid-client';
import type { Env } from '../env';
import { deleteSession } from '../util/session';

export async function handleLogout(c: Context<{ Bindings: Env }>) {
	const sessionId = getCookie(c, 'session_id');
	if (sessionId) {
		await deleteSession(c.env.KV, sessionId);
	}

	deleteCookie(c, 'session_id', {
		path: '/',
	});

	const config = await client.discovery(new URL(c.env.ISSUER), c.env.CLIENT_ID);

	// generate RP-Initiated Logout URL
	const parameters: Record<string, string> = {
		post_logout_redirect_uri: new URL(c.req.url).origin,
	};
	const logoutUrl = client.buildEndSessionUrl(config, parameters);

	return c.redirect(logoutUrl.href);
}
