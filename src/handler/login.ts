import type { Context } from 'hono';
import * as client from 'openid-client';
import type { Env } from '../env';

export async function handleLogin(c: Context<{ Bindings: Env }>) {
	const originalUrl = c.req.query('redirect') || '/';
	const config = await client.discovery(new URL(c.env.ISSUER), c.env.CLIENT_ID);

	// generate code_verifier for PKCE
	const code_verifier = client.randomPKCECodeVerifier();
	const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);

	// generate state
	const state = crypto.randomUUID();

	await c.env.KV.put(`state:${state}`, JSON.stringify({ code_verifier, originalUrl }), { expirationTtl: 300 });

	const parameters: Record<string, string> = {
		redirect_uri: c.env.CALLBACK_URL,
		scope: 'openid profile',
		state,
		code_challenge,
		code_challenge_method: 'S256',
	};
	const authorizationUrl = client.buildAuthorizationUrl(config, parameters);

	return c.redirect(authorizationUrl.href);
}
