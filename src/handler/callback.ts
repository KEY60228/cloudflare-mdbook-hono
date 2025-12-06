import type { Context } from 'hono';
import { setCookie } from 'hono/cookie';
import * as client from 'openid-client';
import type { Env } from '../env';
import { setSession } from '../util/session';
import { SESSION_EXPIRY_HOURS } from '../const';

export async function handleCallback(c: Context<{ Bindings: Env }>) {
	const currentUrl = new URL(c.req.url);
	const config = await client.discovery(new URL(c.env.ISSUER), c.env.CLIENT_ID);

	const state = currentUrl.searchParams.get('state');
	if (!state) {
		return c.text('Missing state parameter', 400);
	}

	const stateDataStr = await c.env.KV.get(`state:${state}`);
	if (!stateDataStr) {
		return c.text('Invalid state', 400);
	}

	const stateData = JSON.parse(stateDataStr) as {
		code_verifier: string;
		originalUrl: string;
	};

	await c.env.KV.delete(`state:${state}`);

	const tokens = await client.authorizationCodeGrant(config, currentUrl, {
		pkceCodeVerifier: stateData.code_verifier,
		expectedState: state,
	});

	const claims = tokens.claims();
	if (!claims) {
		return c.text('No ID Token returned', 400);
	}

	const sessionId = crypto.randomUUID();
	const session = {
		userId: claims.sub,
		accessToken: tokens.access_token,
		refreshToken: tokens.refresh_token,
		expiresAt: Date.now() + SESSION_EXPIRY_HOURS * 3600 * 1000,
		createdAt: Date.now(),
	};

	await setSession(c.env.KV, sessionId, session, SESSION_EXPIRY_HOURS * 3600);

	setCookie(c, 'session_id', sessionId, {
		httpOnly: true,
		secure: true,
		sameSite: 'Lax',
		maxAge: SESSION_EXPIRY_HOURS * 3600,
		path: '/',
	});

	return c.redirect(stateData.originalUrl);
}
