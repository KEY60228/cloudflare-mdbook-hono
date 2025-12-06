# cloudflare-mdbook-hono

A scaffold project for hosting mdBook on Cloudflare Workers with OIDC authentication. Only authenticated users can access your documentation.

## Prerequisites

- [Node.js](https://nodejs.org/) (v24 or later)
- [mdBook](https://rust-lang.github.io/mdBook/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/KEY60228/cloudflare-mdbook-hono.git
cd cloudflare-mdbook-hono
npm install
```

### 2. Configure wrangler.jsonc

Update the `CALLBACK_URL` in `wrangler.jsonc` to match your Worker URL:

```jsonc
{
  "vars": {
    "CALLBACK_URL": "https://your-worker-name.your-subdomain.workers.dev/auth/callback"
  }
}
```

### 3. Set Cloudflare Secrets

Configure your OIDC provider credentials:

```bash
npx wrangler secret put ISSUER
# Enter your OIDC issuer URL (e.g., https://accounts.google.com)

npx wrangler secret put CLIENT_ID
# Enter your OIDC client ID
```

### 4. Set GitHub Secrets (for CI/CD)

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

### 5. Customize your content

Edit the mdBook source files in `mdbook/src/`:

- `SUMMARY.md` - Table of contents
- `chapter_1.md` - Your content (add more chapters as needed)

Refer to the [mdBook documentation](https://rust-lang.github.io/mdBook/) for more details.

## Deploy

### Manual deployment

```bash
cd mdbook && mdbook build && cd ..
npm run deploy
```

### Automatic deployment

Push to the `main` branch to trigger automatic deployment via GitHub Actions.
