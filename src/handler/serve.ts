import type { Context } from 'hono';
import type { Env } from '../env';

export async function handleServe(c: Context<{ Bindings: Env }>) {
	const url = new URL(c.req.url);

	try {
		let pathname = url.pathname;
		if (pathname.endsWith('/')) {
			pathname += 'index.html';
		}

		const assetUrl = new URL(pathname, url.origin);
		const asset = await c.env.ASSETS.fetch(new Request(assetUrl));

		if (asset.status === 404) {
			return c.notFound();
		}

		const response = new Response(asset.body, asset);
		response.headers.set('Cache-Control', 'public, max-age=3600');

		return response;
	} catch (e) {
		console.error('Error serving static file:', e);
		return c.notFound();
	}
}
