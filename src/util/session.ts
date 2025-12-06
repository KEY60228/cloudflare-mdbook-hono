export interface Session {
	userId: string;
	accessToken: string;
	refreshToken?: string;
	expiresAt: number;
	createdAt: number;
}

export async function getSession(kv: KVNamespace, sessionId: string): Promise<Session | null> {
	const data = await kv.get(`session:${sessionId}`, 'json');
	return data as Session | null;
}

export async function setSession(kv: KVNamespace, sessionId: string, session: Session, expirySeconds: number): Promise<void> {
	await kv.put(`session:${sessionId}`, JSON.stringify(session), {
		expirationTtl: expirySeconds,
	});
}

export async function deleteSession(kv: KVNamespace, sessionId: string): Promise<void> {
	await kv.delete(`session:${sessionId}`);
}

export function isSessionValid(session: Session): boolean {
	return session.expiresAt > Date.now();
}
