interface Secrets {
	ISSUER: string;
	CLIENT_ID: string;
}

export interface Env extends Cloudflare.Env, Secrets {}
